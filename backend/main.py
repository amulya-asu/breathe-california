"""
Breathe California — FastAPI Backend
Serves PM2.5 forecasts from predictions_latest.json
Optionally reads from Azure Blob Storage or local file.
"""

import os
import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Breathe California API",
    description="PM2.5 forecast API for California counties",
    version="1.0.0",
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

    # Return cache if fresh (< 5 min old)
    if _cache["data"] and _cache["loaded_at"]:
        age = (now - _cache["loaded_at"]).total_seconds()
        if age < 300:
            return _cache["data"]

    # Try local file first
    if os.path.exists(LOCAL_PATH):
        with open(LOCAL_PATH, "r") as f:
            data = json.load(f)
        _cache["data"] = data
        _cache["loaded_at"] = now
        return data

    # Try Azure Blob
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


def _aggregate_county(predictions: list, county_name: str) -> dict:
    """Aggregate multiple station predictions into one county-level response."""
    stations = [p for p in predictions if p["county"] == county_name]
    if not stations:
        return None

    # Average current PM2.5 across stations
    avg_pm25 = sum(s["current_pm25"] for s in stations) / len(stations)
    aqi = _pm25_to_aqi(avg_pm25)
    status, theme = _aqi_status(aqi)

    # Average hourly forecasts
    hourly = []
    for h in range(24):
        vals = []
        for s in stations:
            if h < len(s["hourly_forecast"]):
                vals.append(s["hourly_forecast"][h]["pm25"])
        if vals:
            avg = sum(vals) / len(vals)
            hourly.append(round(avg, 1))
        else:
            hourly.append(0)

    # Average daily forecasts
    daily = []
    day_names = ["Today", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for d in range(7):
        vals = []
        for s in stations:
            if d < len(s["daily_forecast"]):
                vals.append(s["daily_forecast"][d]["pm25"])
        if vals:
            avg = sum(vals) / len(vals)
            day_aqi = _pm25_to_aqi(avg)
            daily.append({
                "day": day_names[d] if d < len(day_names) else f"Day {d+1}",
                "aqi": day_aqi,
                "pm25": round(avg, 1),
            })

    # Tomorrow's PM2.5 (day 1)
    tmr_pm25 = daily[1]["pm25"] if len(daily) > 1 else avg_pm25

    return {
        "county": county_name,
        "aqi": aqi,
        "pm25": round(avg_pm25, 1),
        "tmr": round(tmr_pm25, 1),
        "status": status,
        "theme": theme,
        "desc": f"Current PM2.5 is {avg_pm25:.1f} µg/m³ across {len(stations)} monitoring stations.",
        "hourly": hourly,
        "weekly": daily,
        "n_stations": len(stations),
        "updated_at": stations[0].get("updated_at", ""),
    }


# ── Routes ──────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"service": "Breathe California API", "status": "ok"}


@app.get("/api/counties")
async def list_counties():
    """List all available counties with current AQI."""
    data = _load_predictions()
    counties = set(p["county"] for p in data["predictions"])
    result = []
    for county in sorted(counties):
        info = _aggregate_county(data["predictions"], county)
        if info:
            result.append({
                "county": county,
                "aqi": info["aqi"],
                "pm25": info["pm25"],
                "status": info["status"],
                "theme": info["theme"],
            })
    return {
        "generated_at": data.get("generated_at", ""),
        "n_counties": len(result),
        "counties": result,
    }


@app.get("/api/forecast/{county}")
async def get_forecast(county: str):
    """Get full forecast for a specific county."""
    data = _load_predictions()
    result = _aggregate_county(data["predictions"], county)
    if not result:
        raise HTTPException(status_code=404, detail=f"County '{county}' not found")
    return result


@app.post("/api/chat")
async def chat(body: dict):
    """Chat endpoint — forwards to Gemini with AQI context."""
    message = body.get("message", "")
    county = body.get("county", "Fresno")

    if not message:
        raise HTTPException(status_code=400, detail="Message required")

    # Get current AQI context
    data = _load_predictions()
    county_data = _aggregate_county(data["predictions"], county)

    context = ""
    if county_data:
        context = (
            f"Current air quality in {county}: "
            f"AQI {county_data['aqi']} ({county_data['status']}), "
            f"PM2.5 {county_data['pm25']} µg/m³. "
            f"Tomorrow forecast: {county_data['tmr']} µg/m³. "
            f"Based on {county_data['n_stations']} monitoring stations."
        )

    # Try Groq via REST API (no SDK dependency issues)
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
                                "You are an air quality assistant for Breathe California. "
                                "Respond in 2-3 sentences. Be helpful and health-focused. "
                                "Use the provided air quality data to give specific advice."
                            ),
                        },
                        {
                            "role": "user",
                            "content": f"Context: {context}\n\nQuestion: {message}",
                        },
                    ],
                    "max_tokens": 200,
                },
                timeout=10,
            )
            r.raise_for_status()
            return {"reply": r.json()["choices"][0]["message"]["content"]}
        except Exception as e:
            return {"reply": f"I couldn't connect to the AI service. {context}"}

    # Fallback: simple rule-based response
    if county_data:
        aqi = county_data["aqi"]
        if aqi <= 50:
            advice = "Air quality is great! Perfect for outdoor activities."
        elif aqi <= 100:
            advice = "Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion."
        elif aqi <= 150:
            advice = "Sensitive groups should reduce outdoor activity. Consider wearing a mask."
        else:
            advice = "Air quality is poor. Stay indoors if possible."
        return {"reply": f"{county}: AQI {aqi} ({county_data['status']}). {advice}"}

    return {"reply": "I don't have data for that county right now."}


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
