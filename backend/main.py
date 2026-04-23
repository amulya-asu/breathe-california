"""
Breathe California — FastAPI Backend
Serves PM2.5 forecasts from predictions_latest.json
Supports both station-level and county-level views.
"""

import os
import json
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Breathe California API",
    description="PM2.5 forecast API for California monitoring stations",
    version="2.0.0",
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ──────────────────────────────────────────────────────
AZURE_ACCOUNT = os.getenv("AZURE_STORAGE_ACCOUNT", "aqidatalake")
AZURE_KEY = os.getenv("AZURE_STORAGE_KEY", "")
AZURE_CONTAINER = os.getenv("AZURE_BLOB_CONTAINER", "predictions")
LOCAL_PATH = os.getenv("LOCAL_PREDICTIONS_PATH", "predictions_latest.json")
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

# ── Cache ───────────────────────────────────────────────────────
_cache = {"data": None, "loaded_at": None}


def _pm25_to_aqi(pm25: float) -> int:
    """Convert PM2.5 concentration to AQI using EPA breakpoints."""
    breakpoints = [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 350.4, 301, 400),
        (350.5, 500.4, 401, 500),
    ]
    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= pm25 <= bp_hi:
            return round(((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (pm25 - bp_lo) + aqi_lo)
    return 500 if pm25 > 500.4 else 0


def _aqi_status(aqi: int):
    """Return (status_label, theme_key) for an AQI value."""
    if aqi <= 50:
        return "Good", "good"
    if aqi <= 100:
        return "Moderate", "moderate"
    if aqi <= 150:
        return "Unhealthy for Sensitive Groups", "sensitive"
    if aqi <= 200:
        return "Unhealthy", "unhealthy"
    return "Hazardous", "hazardous"


def _load_predictions() -> dict:
    """Load predictions from local file or Azure Blob. Cache for 5 minutes."""
    now = datetime.now(timezone.utc)

    if _cache["data"] and _cache["loaded_at"]:
        age = (now - _cache["loaded_at"]).total_seconds()
        if age < 300:
            return _cache["data"]

    if os.path.exists(LOCAL_PATH):
        with open(LOCAL_PATH, "r") as f:
            data = json.load(f)
        _cache["data"] = data
        _cache["loaded_at"] = now
        return data

    if AZURE_KEY:
        try:
            from azure.storage.blob import BlobServiceClient
            client = BlobServiceClient(
                account_url=f"https://{AZURE_ACCOUNT}.blob.core.windows.net",
                credential=AZURE_KEY,
            )
            blob = client.get_blob_client(AZURE_CONTAINER, "predictions_latest.json")
            content = blob.download_blob().readall()
            data = json.loads(content)
            _cache["data"] = data
            _cache["loaded_at"] = now
            return data
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Failed to load predictions: {e}")

    raise HTTPException(status_code=503, detail="No predictions available")


def _station_id(prediction: dict) -> str:
    """Generate a stable station ID from fips + coordinates."""
    return f"{prediction['county_fips']}_{prediction['latitude']}_{prediction['longitude']}"


def _build_station_response(p: dict) -> dict:
    """Build a full forecast response for a single station."""
    pm25 = p["current_pm25"]
    aqi = _pm25_to_aqi(pm25)
    status, theme = _aqi_status(aqi)

    # Hourly: first entry is current reading, rest are model predictions
    hourly = [round(pm25, 1)]
    for h_data in p.get("hourly_forecast", []):
        hourly.append(round(h_data["pm25"], 1))

    # Daily forecasts
    day_names = ["Today", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    daily = []
    for i, d_data in enumerate(p.get("daily_forecast", [])):
        day_aqi = _pm25_to_aqi(d_data["pm25"])
        daily.append({
            "day": day_names[i] if i < len(day_names) else f"Day {i+1}",
            "aqi": day_aqi,
            "pm25": round(d_data["pm25"], 1),
        })

    tmr_pm25 = daily[1]["pm25"] if len(daily) > 1 else pm25

    # Staleness: how old is this reading
    now_utc = datetime.now(timezone.utc)
    updated_at = p.get("updated_at", "")
    hours_old = 0
    if updated_at:
        try:
            updated_dt = datetime.fromisoformat(updated_at)
            hours_old = max(0, int((now_utc - updated_dt).total_seconds() / 3600))
        except Exception:
            pass
    if hours_old <= 1:
        freshness = "live"
    elif hours_old <= 3:
        freshness = "recent"
    else:
        freshness = "stale"

    place = p.get("place_name", p["county"])

    return {
        "station_id": _station_id(p),
        "name": place,
        "county": p["county"],
        "county_fips": p["county_fips"],
        "latitude": p["latitude"],
        "longitude": p["longitude"],
        "aqi": aqi,
        "pm25": round(pm25, 1),
        "tmr": round(tmr_pm25, 1),
        "status": status,
        "theme": theme,
        "freshness": freshness,
        "desc": f"Current PM2.5 is {pm25:.1f} \u00b5g/m\u00b3 in {place}.",
        "hourly": hourly,
        "weekly": daily,
        "updated_at": updated_at,
    }


# ── Routes ──────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"service": "Breathe California API", "status": "ok", "version": "2.0.0"}


@app.get("/api/stations")
async def list_stations():
    """List all monitoring stations with current AQI."""
    data = _load_predictions()
    stations = []
    for p in data["predictions"]:
        aqi = _pm25_to_aqi(p["current_pm25"])
        status, theme = _aqi_status(aqi)

        # Staleness
        now_utc = datetime.now(timezone.utc)
        updated_at = p.get("updated_at", "")
        hours_old = 0
        if updated_at:
            try:
                updated_dt = datetime.fromisoformat(updated_at)
                hours_old = max(0, int((now_utc - updated_dt).total_seconds() / 3600))
            except Exception:
                pass
        if hours_old <= 1:
            freshness = "live"
        elif hours_old <= 3:
            freshness = "recent"
        else:
            freshness = "stale"

        stations.append({
            "station_id": _station_id(p),
            "name": p.get("place_name", p["county"]),
            "county": p["county"],
            "latitude": p["latitude"],
            "longitude": p["longitude"],
            "aqi": aqi,
            "pm25": round(p["current_pm25"], 1),
            "status": status,
            "theme": theme,
            "freshness": freshness,
        })
    return {
        "generated_at": data.get("generated_at", ""),
        "n_stations": len(stations),
        "stations": stations,
    }


@app.get("/api/station/{station_id}")
async def get_station_forecast(station_id: str):
    """Get full forecast for a specific station."""
    data = _load_predictions()
    for p in data["predictions"]:
        if _station_id(p) == station_id:
            return _build_station_response(p)
    raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found")


@app.get("/api/counties")
async def list_counties():
    """List all available counties with current AQI (aggregated from stations)."""
    data = _load_predictions()
    county_map = {}
    for p in data["predictions"]:
        county = p["county"]
        if county not in county_map:
            county_map[county] = []
        county_map[county].append(p["current_pm25"])

    result = []
    for county in sorted(county_map.keys()):
        avg_pm25 = sum(county_map[county]) / len(county_map[county])
        aqi = _pm25_to_aqi(avg_pm25)
        status, theme = _aqi_status(aqi)
        result.append({
            "county": county,
            "aqi": aqi,
            "pm25": round(avg_pm25, 1),
            "status": status,
            "theme": theme,
            "n_stations": len(county_map[county]),
        })
    return {
        "generated_at": data.get("generated_at", ""),
        "n_counties": len(result),
        "counties": result,
    }


@app.get("/api/forecast/{county}")
async def get_forecast(county: str):
    """Get forecast for a county (returns list of stations in that county)."""
    data = _load_predictions()
    stations = [p for p in data["predictions"] if p["county"] == county]
    if not stations:
        raise HTTPException(status_code=404, detail=f"County '{county}' not found")

    station_responses = [_build_station_response(p) for p in stations]

    # Also compute county-level aggregate for the header
    avg_pm25 = sum(s["pm25"] for s in station_responses) / len(station_responses)
    aqi = _pm25_to_aqi(avg_pm25)
    status, theme = _aqi_status(aqi)

    # Pick the station with the freshest data as representative
    best = min(station_responses, key=lambda s: {"live": 0, "recent": 1, "stale": 2}.get(s["freshness"], 3))

    return {
        "county": county,
        "aqi": aqi,
        "pm25": round(avg_pm25, 1),
        "tmr": best["tmr"],
        "status": status,
        "theme": theme,
        "desc": f"Current PM2.5 is {avg_pm25:.1f} \u00b5g/m\u00b3 across {len(stations)} monitoring stations.",
        "hourly": best["hourly"],
        "weekly": best["weekly"],
        "n_stations": len(stations),
        "stations": station_responses,
        "updated_at": best["updated_at"],
    }


@app.post("/api/chat")
async def chat(body: dict):
    """Chat endpoint — forwards to Groq LLM with full AQI context."""
    message = body.get("message", "")
    county = body.get("county", "")
    station_id = body.get("station_id", "")

    if not message:
        raise HTTPException(status_code=400, detail="Message required")

    data = _load_predictions()
    context = ""
    resp = None

    # Try station-level context first, then county
    if station_id:
        for p in data["predictions"]:
            if _station_id(p) == station_id:
                resp = _build_station_response(p)
                break

    # Try matching place_name from the message (specific station mentioned)
    is_county_query = False
    if not resp:
        msg_lower = message.lower()
        for p in data["predictions"]:
            place = p.get("place_name", "").lower()
            if place and len(place) > 2 and place in msg_lower:
                resp = _build_station_response(p)
                break

    # If still nothing and we have a county, aggregate across all county stations
    if not resp and county:
        county_stations = [p for p in data["predictions"] if p["county"] == county]
        if county_stations:
            is_county_query = True
            station_responses = [_build_station_response(p) for p in county_stations]
            avg_pm25 = sum(s["pm25"] for s in station_responses) / len(station_responses)
            aqi = _pm25_to_aqi(avg_pm25)
            status, theme = _aqi_status(aqi)
            best = min(station_responses, key=lambda s: {"live": 0, "recent": 1, "stale": 2}.get(s["freshness"], 3))
            resp = {
                "name": county,
                "county": county,
                "aqi": aqi,
                "pm25": round(avg_pm25, 1),
                "status": status,
                "tmr": best["tmr"],
                "freshness": best["freshness"],
                "hourly": best["hourly"],
                "weekly": best["weekly"],
                "n_stations": len(station_responses),
                "station_breakdown": [
                    f"{s['name']}: AQI {s['aqi']}, PM2.5 {s['pm25']}µg/m³ ({s['freshness']})"
                    for s in station_responses
                ],
            }

    if resp:
        # Build detailed context with hourly + weekly data
        now_utc = datetime.now(timezone.utc)
        hourly_lines = []
        for i, pm in enumerate(resp.get("hourly", [])):
            t = now_utc + timedelta(hours=i)
            label = "Now" if i == 0 else t.strftime("%-I%p").lower()
            hourly_lines.append(f"{label}: {pm} \u00b5g/m\u00b3")

        weekly_lines = []
        for d in resp.get("weekly", []):
            weekly_lines.append(f"{d['day']}: PM2.5 {d['pm25']} \u00b5g/m\u00b3 (AQI {d['aqi']})")

        if is_county_query:
            context = (
                f"Location: {resp['county']} County (averaged across {resp['n_stations']} stations)\n"
                f"County average: AQI {resp['aqi']} ({resp['status']}), PM2.5 {resp['pm25']} \u00b5g/m\u00b3\n"
                f"Tomorrow forecast: {resp['tmr']} \u00b5g/m\u00b3\n\n"
                f"Per-station breakdown:\n" + '\n'.join(resp['station_breakdown']) + "\n\n"
                f"Forecast (next 24h): {', '.join(hourly_lines[:12])}\n"
                f"... {', '.join(hourly_lines[12:])}\n\n"
                f"7-day forecast:\n" + '\n'.join(weekly_lines)
            )
        else:
            context = (
                f"Location: {resp['name']} ({resp['county']} County)\n"
                f"Current: AQI {resp['aqi']} ({resp['status']}), PM2.5 {resp['pm25']} \u00b5g/m\u00b3\n"
                f"Data freshness: {resp['freshness']}\n"
                f"Tomorrow forecast: {resp['tmr']} \u00b5g/m\u00b3\n\n"
                f"Next 24 hours (PM2.5): {', '.join(hourly_lines[:12])}\n"
                f"... {', '.join(hourly_lines[12:])}\n\n"
                f"7-day forecast:\n" + '\n'.join(weekly_lines)
            )

    if GROQ_KEY:
        try:
            import requests as req
            r = req.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are a California air quality assistant. "
                                "Answer using the data provided. Be concise and specific. "
                                "If the question is about a different location than the data, say so."
                            ),
                        },
                        {
                            "role": "user",
                            "content": f"Data:\n{context}\n\nQuestion: {message}",
                        },
                    ],
                    "max_tokens": 350,
                },
                timeout=10,
            )
            r.raise_for_status()
            return {"reply": r.json()["choices"][0]["message"]["content"]}
        except Exception:
            return {"reply": f"I couldn't connect to the AI service. {context}"}

    # Fallback
    if context:
        return {"reply": context}
    return {"reply": "I don't have data for that location right now."}


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    try:
        data = _load_predictions()
        return {
            "status": "healthy",
            "predictions_loaded": True,
            "n_stations": data.get("n_stations", 0),
            "generated_at": data.get("generated_at", ""),
        }
    except Exception:
        return {"status": "degraded", "predictions_loaded": False}
