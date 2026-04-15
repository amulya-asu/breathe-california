"""
ETL Pipeline — Scheduled hourly via GitHub Actions
Fetches live PM2.5 + weather, computes features, runs 30 XGBoost models,
uploads predictions_latest.json to Azure Blob Storage.
"""

import os
import json
import time
import numpy as np
import pandas as pd
import requests
import xgboost as xgb
from datetime import datetime, timezone, timedelta
from math import radians, cos, sin, asin, sqrt
from azure.storage.blob import BlobServiceClient

# ── Config ──────────────────────────────────────────────────────
AZURE_ACCOUNT = os.environ["AZURE_STORAGE_ACCOUNT"]
AZURE_KEY = os.environ["AZURE_STORAGE_KEY"]
AZURE_CONTAINER = os.environ["AZURE_BLOB_CONTAINER"]
AIRNOW_API_KEY = os.environ["AIRNOW_API_KEY"]

STATION_COLS = ["county_fips", "latitude", "longitude"]
N_NEIGHBORS = 5
FEATURE_COLS = [
    "temp_c", "dewpoint_c", "pressure_hpa",
    "wind_dir_deg", "wind_speed_mps", "precip_1hr_mm",
    "pm25_lag_1h", "pm25_lag_2h", "pm25_lag_3h",
    "pm25_lag_24h", "pm25_lag_48h",
    "pm25_roll_mean_3h", "pm25_roll_mean_6h",
    "pm25_roll_mean_24h", "pm25_roll_max_24h", "pm25_roll_std_24h",
    "pm25_roll_mean_168h", "pm25_roll_max_168h",
    "wind_speed_mps_lag_1h", "wind_speed_mps_lag_24h", "wind_speed_mps_lag_48h",
    "temp_c_lag_1h", "temp_c_lag_24h", "temp_c_lag_48h",
    "pressure_hpa_lag_1h", "pressure_hpa_lag_24h",
    "precip_1hr_mm_lag_1h", "precip_1hr_mm_lag_24h", "precip_1hr_mm_lag_48h",
    "dewpoint_c_lag_1h", "dewpoint_c_lag_24h",
    "hour_sin", "hour_cos", "month_sin", "month_cos",
    "dow_sin", "dow_cos",
    "hour", "day_of_week", "day_of_year",
    "is_weekend", "is_wildfire_season", "is_winter",
    "latitude", "longitude",
    "is_central_valley", "is_coastal",
    "neighbor_pm25_max_6h", "neighbor_pm25_mean_6h", "neighbor_pm25_max_24h",
]
CENTRAL_VALLEY = ['Fresno','Kings','Merced','Tulare','San Joaquin','Stanislaus','Kern','Madera','Plumas']
COASTAL = ['San Francisco','San Mateo','Marin','Sonoma','Monterey','Santa Barbara','Ventura']


def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return 2 * 6371 * asin(sqrt(a))


def download_blob(blob_client, local_path):
    with open(local_path, "wb") as f:
        f.write(blob_client.download_blob().readall())


def upload_blob(blob_client, local_path):
    with open(local_path, "rb") as f:
        blob_client.upload_blob(f, overwrite=True)


def main():
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    print(f"Pipeline started at {now}")

    # ── Connect to Azure Blob ──
    blob_service = BlobServiceClient(
        account_url=f"https://{AZURE_ACCOUNT}.blob.core.windows.net",
        credential=AZURE_KEY,
    )
    container = blob_service.get_container_client(AZURE_CONTAINER)

    # ── Download stations.csv ──
    print("Downloading stations.csv...")
    download_blob(container.get_blob_client("stations.csv"), "stations.csv")
    stations = pd.read_csv("stations.csv", dtype={"county_fips": str})
    print(f"  {len(stations)} stations loaded")

    # ── Download models ──
    print("Downloading models...")
    os.makedirs("saved_models", exist_ok=True)
    blobs = container.list_blobs(name_starts_with="saved_models/")
    model_count = 0
    for blob in blobs:
        local_path = blob.name
        download_blob(container.get_blob_client(blob.name), local_path)
        model_count += 1
    print(f"  {model_count} models downloaded")

    # ── Download or create local history ──
    history_blob = container.get_blob_client("local_history.parquet")
    try:
        download_blob(history_blob, "local_history.parquet")
        df_history = pd.read_parquet("local_history.parquet")
        df_history["datetime_hour"] = pd.to_datetime(df_history["datetime_hour"], utc=True)
        print(f"  History loaded: {len(df_history)} rows")
    except Exception:
        print("  No history found — bootstrapping 7 days...")
        df_history = bootstrap_history(stations, now)
        print(f"  Bootstrapped: {len(df_history)} rows")

    # ── Fetch current hour ──
    print("Fetching live data...")
    df_live = fetch_live(stations, now)
    print(f"  Live rows: {len(df_live)}")

    if len(df_live) == 0:
        print("ERROR: No live data fetched. Exiting.")
        return

    # ── Combine + compute features ──
    print("Computing features...")
    df = pd.concat([df_history, df_live], ignore_index=True)
    df["datetime_hour"] = pd.to_datetime(df["datetime_hour"], utc=True)
    df = df.sort_values(STATION_COLS + ["datetime_hour"]).reset_index(drop=True)
    df = df.drop_duplicates(subset=STATION_COLS + ["datetime_hour"], keep="last")
    df = compute_features(df)
    print(f"  Features: {sum(c in df.columns for c in FEATURE_COLS)}/50")

    # ── Update history ──
    raw_cols = ["county_fips", "latitude", "longitude", "county",
                "datetime_hour", "pm25", "temp_c", "dewpoint_c",
                "pressure_hpa", "wind_dir_deg", "wind_speed_mps", "precip_1hr_mm"]
    df_save = df[raw_cols].copy()
    df_save["county_fips"] = df_save["county_fips"].astype(str)
    cutoff = now - timedelta(days=10)
    df_save = df_save[df_save["datetime_hour"] >= cutoff]
    df_save.to_parquet("local_history.parquet", index=False)
    upload_blob(history_blob, "local_history.parquet")
    print(f"  History updated: {len(df_save)} rows")

    # ── Inference ──
    print("Running inference...")
    df_latest = df.sort_values("datetime_hour").groupby(STATION_COLS).tail(1).reset_index(drop=True)

    HOURLY_HORIZONS = list(range(1, 25))
    DAILY_HORIZONS = [24, 48, 72, 96, 120, 144, 168]
    ALL_HORIZONS = sorted(set(HOURLY_HORIZONS + DAILY_HORIZONS))

    models = {}
    for h in ALL_HORIZONS:
        target = f"pm25_next_{h}h"
        path = f"saved_models/{target}.json"
        if os.path.exists(path):
            m = xgb.XGBRegressor()
            m.load_model(path)
            models[target] = m
    print(f"  Loaded {len(models)} models")

    all_predictions = []
    for _, row in df_latest.iterrows():
        X = pd.DataFrame([row[FEATURE_COLS]])
        hourly = []
        for h in HOURLY_HORIZONS:
            t = f"pm25_next_{h}h"
            if t in models:
                p = max(float(np.expm1(models[t].predict(X)[0])), 0)
                hourly.append({"hour": h, "pm25": round(p, 2)})
        daily = []
        for h in DAILY_HORIZONS:
            t = f"pm25_next_{h}h"
            if t in models:
                p = max(float(np.expm1(models[t].predict(X)[0])), 0)
                daily.append({"day": h // 24, "pm25": round(p, 2)})
        all_predictions.append({
            "county_fips": row["county_fips"],
            "county": row["county"],
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "current_pm25": float(row["pm25"]),
            "updated_at": row["datetime_hour"].isoformat(),
            "hourly_forecast": hourly,
            "daily_forecast": daily,
        })

    print(f"  Predictions: {len(all_predictions)} stations")

    # ── Save + upload ──
    output = {
        "generated_at": now.isoformat(),
        "n_stations": len(all_predictions),
        "predictions": all_predictions,
    }
    with open("predictions_latest.json", "w") as f:
        json.dump(output, f, indent=2)

    upload_blob(container.get_blob_client("predictions_latest.json"), "predictions_latest.json")
    print(f"Uploaded predictions_latest.json ({len(all_predictions)} stations)")
    print("PIPELINE COMPLETE")


def bootstrap_history(stations, now):
    start_date = (now - timedelta(days=8)).strftime("%Y-%m-%d")
    end_date = (now - timedelta(days=1)).strftime("%Y-%m-%d")

    records = []
    for _, station in stations.iterrows():
        try:
            r = requests.get("https://archive-api.open-meteo.com/v1/archive", params={
                "latitude": station["latitude"], "longitude": station["longitude"],
                "start_date": start_date, "end_date": end_date,
                "hourly": "temperature_2m,dew_point_2m,pressure_msl,wind_direction_10m,wind_speed_10m,precipitation",
                "timezone": "UTC",
            }, timeout=30)
            r.raise_for_status()
            data = r.json()["hourly"]
            times = pd.to_datetime(data["time"], utc=True)
            for i, t in enumerate(times):
                records.append({
                    "county_fips": station["county_fips"], "latitude": station["latitude"],
                    "longitude": station["longitude"], "county": station["county"],
                    "datetime_hour": t, "pm25": np.nan,
                    "temp_c": data["temperature_2m"][i], "dewpoint_c": data["dew_point_2m"][i],
                    "pressure_hpa": data["pressure_msl"][i], "wind_dir_deg": data["wind_direction_10m"][i],
                    "wind_speed_mps": data["wind_speed_10m"][i], "precip_1hr_mm": data["precipitation"][i],
                })
            time.sleep(0.15)
        except Exception:
            pass

    df = pd.DataFrame(records)

    # Fetch PM2.5 from AirNow
    pm25_map = {}
    current_date = (now - timedelta(days=8)).date()
    while current_date <= now.date():
        try:
            r = requests.get("https://www.airnowapi.org/aq/data/", params={
                "startDate": f"{current_date}T00", "endDate": f"{current_date}T23",
                "parameters": "PM25", "BBOX": "-124.41,32.53,-114.13,42.01",
                "dataType": "C", "format": "application/json", "verbose": 1,
                "monitorType": 0, "includeRawConcentrations": 1, "API_KEY": AIRNOW_API_KEY,
            }, timeout=15)
            r.raise_for_status()
            data = r.json()
            if data:
                df_an = pd.DataFrame(data)
                # Filter out invalid readings (-999, negatives)
                if "RawConcentration" in df_an.columns:
                    df_an = df_an[df_an["RawConcentration"] >= 0].copy()
                elif "Value" in df_an.columns:
                    df_an = df_an[df_an["Value"] >= 0].copy()
                for _, station in stations.iterrows():
                    best_dist, best_pm25, best_time = float("inf"), None, None
                    for _, mon in df_an.iterrows():
                        d = haversine(station["latitude"], station["longitude"], mon["Latitude"], mon["Longitude"])
                        if d < best_dist:
                            best_dist = d
                            best_pm25 = mon.get("RawConcentration", mon.get("Value"))
                            utc_str = mon.get("UTC", "")
                            if utc_str:
                                best_time = pd.to_datetime(utc_str, utc=True)
                    if best_dist < 50 and best_pm25 is not None and best_pm25 >= 0 and best_time:
                        key = (station["county_fips"], station["latitude"], station["longitude"])
                        pm25_map[(key, best_time.floor("h"))] = float(best_pm25)
            time.sleep(1.0)
        except Exception:
            pass
        current_date += timedelta(days=1)

    for i, row in df.iterrows():
        key = ((row["county_fips"], row["latitude"], row["longitude"]), row["datetime_hour"])
        if key in pm25_map:
            df.at[i, "pm25"] = pm25_map[key]

    df = df.sort_values(STATION_COLS + ["datetime_hour"])
    df["pm25"] = df.groupby(STATION_COLS)["pm25"].transform(lambda x: x.ffill())
    df = df.dropna(subset=["pm25"]).reset_index(drop=True)
    return df


def fetch_live(stations, now):
    try:
        r = requests.get("https://www.airnowapi.org/aq/data/", params={
            "startDate": (now - timedelta(hours=2)).strftime("%Y-%m-%dT%H"),
            "endDate": now.strftime("%Y-%m-%dT%H"),
            "parameters": "PM25", "BBOX": "-124.41,32.53,-114.13,42.01",
            "dataType": "C", "format": "application/json", "verbose": 0,
            "monitorType": 0, "includeRawConcentrations": 1, "API_KEY": AIRNOW_API_KEY,
        }, timeout=15)
        r.raise_for_status()
        df_airnow = pd.DataFrame(r.json())
    except Exception:
        return pd.DataFrame()

    # Filter out invalid readings before matching
    if "RawConcentration" in df_airnow.columns:
        df_airnow = df_airnow[df_airnow["RawConcentration"] >= 0].copy()
    elif "Value" in df_airnow.columns:
        df_airnow = df_airnow[df_airnow["Value"] >= 0].copy()

    records = []
    for _, station in stations.iterrows():
        lat, lon = station["latitude"], station["longitude"]
        pm25_val = None
        if len(df_airnow) > 0:
            best_dist = float("inf")
            for _, mon in df_airnow.iterrows():
                d = haversine(lat, lon, mon["Latitude"], mon["Longitude"])
                if d < best_dist:
                    best_dist = d
                    pm25_val = mon.get("RawConcentration", mon.get("Value"))
            if best_dist >= 50 or pm25_val is None or pm25_val < 0:
                pm25_val = None
        if pm25_val is None:
            continue
        try:
            r = requests.get("https://api.open-meteo.com/v1/forecast", params={
                "latitude": lat, "longitude": lon,
                "hourly": "temperature_2m,dew_point_2m,pressure_msl,wind_direction_10m,wind_speed_10m,precipitation",
                "forecast_days": 1,
            }, timeout=10)
            r.raise_for_status()
            h = r.json()["hourly"]
            records.append({
                "county_fips": station["county_fips"], "latitude": lat, "longitude": lon,
                "county": station["county"], "datetime_hour": now, "pm25": float(pm25_val),
                "temp_c": float(h["temperature_2m"][-1]), "dewpoint_c": float(h["dew_point_2m"][-1]),
                "pressure_hpa": float(h["pressure_msl"][-1]), "wind_dir_deg": float(h["wind_direction_10m"][-1]),
                "wind_speed_mps": float(h["wind_speed_10m"][-1]), "precip_1hr_mm": float(h["precipitation"][-1]),
            })
            time.sleep(0.1)
        except Exception:
            pass
    return pd.DataFrame(records)


def compute_features(df):
    sg = df.groupby(STATION_COLS, sort=False)
    for lag in [1, 2, 3, 24, 48]:
        df[f"pm25_lag_{lag}h"] = sg["pm25"].shift(lag)

    pm25_shifted = sg["pm25"].shift(1)
    gids = df.groupby(STATION_COLS, sort=False).ngroup()
    df["pm25_roll_mean_3h"] = pm25_shifted.groupby(gids).transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["pm25_roll_mean_6h"] = pm25_shifted.groupby(gids).transform(lambda x: x.rolling(6, min_periods=1).mean())
    df["pm25_roll_mean_24h"] = pm25_shifted.groupby(gids).transform(lambda x: x.rolling(24, min_periods=1).mean())
    df["pm25_roll_max_24h"] = pm25_shifted.groupby(gids).transform(lambda x: x.rolling(24, min_periods=1).max())
    df["pm25_roll_std_24h"] = pm25_shifted.groupby(gids).transform(lambda x: x.rolling(24, min_periods=2).std())
    df["pm25_roll_mean_168h"] = pm25_shifted.groupby(gids).transform(lambda x: x.rolling(168, min_periods=1).mean())
    df["pm25_roll_max_168h"] = pm25_shifted.groupby(gids).transform(lambda x: x.rolling(168, min_periods=1).max())

    sg = df.groupby(STATION_COLS, sort=False)
    for col, lags in [('wind_speed_mps',[1,24,48]),('temp_c',[1,24,48]),
                       ('pressure_hpa',[1,24]),('precip_1hr_mm',[1,24,48]),('dewpoint_c',[1,24])]:
        grp = sg[col]
        for lag in lags:
            df[f"{col}_lag_{lag}h"] = grp.shift(lag)

    dt = df["datetime_hour"].dt
    df["hour_sin"] = np.sin(2 * np.pi * dt.hour / 24)
    df["hour_cos"] = np.cos(2 * np.pi * dt.hour / 24)
    df["month_sin"] = np.sin(2 * np.pi * dt.month / 12)
    df["month_cos"] = np.cos(2 * np.pi * dt.month / 12)
    df["dow_sin"] = np.sin(2 * np.pi * dt.dayofweek / 7)
    df["dow_cos"] = np.cos(2 * np.pi * dt.dayofweek / 7)
    df["hour"] = dt.hour
    df["day_of_week"] = dt.dayofweek
    df["day_of_year"] = dt.dayofyear
    df["is_weekend"] = (dt.dayofweek >= 5).astype(int)
    df["is_wildfire_season"] = dt.month.isin([8, 9, 10]).astype(int)
    df["is_winter"] = dt.month.isin([12, 1, 2]).astype(int)

    df["is_central_valley"] = df["county"].isin(CENTRAL_VALLEY).astype(int)
    df["is_coastal"] = df["county"].isin(COASTAL).astype(int)

    # Neighbor features
    sc = df.groupby(STATION_COLS).size().reset_index().drop(columns=[0])
    sc["latitude"] = sc["latitude"].astype(float)
    sc["longitude"] = sc["longitude"].astype(float)
    neighbor_map = {}
    for i, ri in sc.iterrows():
        dists = []
        for j, rj in sc.iterrows():
            if i == j: continue
            dists.append((j, haversine(ri["latitude"], ri["longitude"], rj["latitude"], rj["longitude"])))
        dists.sort(key=lambda x: x[1])
        neighbor_map[i] = [idx for idx, _ in dists[:N_NEIGHBORS]]

    sk2i = {tuple(k): i for i, k in enumerate(sc[STATION_COLS].values.tolist())}
    df["_si"] = df[STATION_COLS].apply(tuple, axis=1).map(sk2i)
    pw = df.pivot_table(index="datetime_hour", columns="_si", values="pm25", aggfunc="first")
    psw = pw.shift(1)

    for feat, win in [("neighbor_pm25_max_6h",6),("neighbor_pm25_mean_6h",6),("neighbor_pm25_max_24h",24)]:
        cols = {}
        for si in range(len(sc)):
            nc = [c for c in neighbor_map.get(si, []) if c in psw.columns]
            if not nc: continue
            nd = psw[nc]
            if "max" in feat:
                cols[si] = nd.max(axis=1).rolling(win, min_periods=1).max()
            else:
                cols[si] = nd.mean(axis=1).rolling(win, min_periods=1).mean()
        fd = pd.concat(cols, axis=1) if cols else pd.DataFrame(index=pw.index)
        fl = fd.stack().reset_index()
        fl.columns = ["datetime_hour", "_si", feat]
        fl["_si"] = fl["_si"].astype(int)
        df = df.merge(fl, on=["datetime_hour", "_si"], how="left")

    df = df.drop(columns=["_si"])
    return df


if __name__ == "__main__":
    main()
