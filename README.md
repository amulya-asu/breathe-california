# Breathe California — AQI Forecast Dashboard

Real-time air quality forecast dashboard for California counties. Powered by live data from AirNow + OpenMeteo, XGBoost ML models, and a FastAPI backend with Groq-powered AI chat.

---

## Architecture

Breathe California follows a simple but production-friendly flow: **collect live environmental data, generate forecasts on a schedule, store a shared prediction file, then serve it through an API to the web app and AI assistant**.

### High-Level System View

```text
AirNow API + Open-Meteo API
        │
        ▼
ETL / Inference Pipeline (Python, hourly via GitHub Actions)
  - Downloads station metadata + trained XGBoost models from Azure Blob Storage
  - Pulls latest PM2.5 readings from AirNow
  - Pulls latest weather signals from Open-Meteo
  - Rebuilds 50 engineered features per station
  - Runs hourly + daily forecast models
  - Writes predictions_latest.json back to Azure Blob Storage
        │
        ▼
FastAPI Backend
  - Loads predictions_latest.json from local disk or Azure Blob Storage
  - Caches results for 5 minutes
  - Converts PM2.5 into EPA AQI categories
  - Exposes station, county, forecast, chat, and health endpoints
        │
        ▼
React Frontend (Vite)
  - Fetches station list and county summaries from the backend
  - Renders California map, hourly strip, and 7-day forecast cards
  - Lets users drill from statewide view to county/station detail
  - Sends user questions to the chat endpoint with forecast context
```

### Layer-by-Layer Explanation

#### 1. Data Sources

The system combines two live external feeds:

- **AirNow API** provides PM2.5 concentration readings from monitoring stations.
- **Open-Meteo API** provides weather features such as temperature, dew point, pressure, wind direction, wind speed, and precipitation.

Real-world example:
If a monitoring station in **Fresno County** reports rising PM2.5 because smoke is drifting in, AirNow supplies that pollutant reading while Open-Meteo supplies the wind and pressure conditions that help explain where the smoke may move next.

#### 2. ETL and Forecast Generation

The forecasting engine lives in [`etl/run_pipeline.py`](/Users/ramreddy/Documents/github/Capstone_DSE/breathe-california/breathe-california/etl/run_pipeline.py). It runs automatically every hour through [`.github/workflows/etl-pipeline.yml`](/Users/ramreddy/Documents/github/Capstone_DSE/breathe-california/breathe-california/.github/workflows/etl-pipeline.yml).

Its job is to:

1. Download station metadata and trained model files from Azure Blob Storage.
2. Load recent station history from `local_history.parquet`.
3. Fetch the newest PM2.5 and weather observations.
4. Compute all feature columns needed by the XGBoost models.
5. Run multiple forecast horizons:
   hourly forecasts for the next **1 to 24 hours**
   daily forecasts out to **7 days**
6. Save the final output as `predictions_latest.json`.

Real-world example:
At **2:05 PM UTC**, the pipeline runs. For a station in **Los Angeles County**, it combines:

- current PM2.5 from AirNow,
- recent lag values such as PM2.5 from 1 hour ago and 24 hours ago,
- rolling trends like 6-hour and 24-hour averages,
- weather conditions like wind speed and precipitation,
- spatial features from nearby monitoring stations.

It then predicts what PM2.5 may look like at **3 PM, 4 PM, 5 PM**, and so on, plus day-level forecasts for the coming week.

#### 3. Shared Storage Layer

Azure Blob Storage acts as the handoff point between the pipeline and the API:

- the ETL pipeline **reads** models, station metadata, and historical state from Azure,
- then **writes** `predictions_latest.json` and updated local history back to Azure,
- the backend can later read the same prediction artifact if no local file is present.

This keeps training/inference and API serving loosely coupled. The backend does not need to rerun the model; it only needs the latest published forecast file.

Real-world example:
If GitHub Actions finishes a new run at **10:05 AM**, the frontend does not contact AirNow directly. Instead, users see the newest data because the backend reads the freshly published JSON snapshot.

#### 4. FastAPI Backend

The API layer is implemented in [`backend/main.py`](/Users/ramreddy/Documents/github/Capstone_DSE/breathe-california/breathe-california/backend/main.py). It is responsible for turning raw model output into app-ready responses.

Key backend responsibilities:

- load `predictions_latest.json` from local disk or Azure,
- cache loaded data for 5 minutes to reduce repeated file/blob reads,
- convert PM2.5 values into EPA AQI scores and labels like `Good`, `Moderate`, or `Unhealthy`,
- aggregate station-level readings into county summaries,
- expose forecast data to the frontend,
- build location-aware context for the Groq-powered chat assistant.

Real-world example:
Suppose **Sacramento County** has multiple stations. The `/api/counties` endpoint averages current PM2.5 across those stations, converts that average into AQI, and returns one county summary for the map/list view. When the user clicks deeper, `/api/forecast/Sacramento` returns both the county summary and the individual stations that make it up.

#### 5. React Frontend

The frontend is a Vite + React application that consumes the API and presents the information as an interactive dashboard.

Main frontend responsibilities:

- fetch all stations for the statewide map,
- fetch county summaries for browsing,
- fetch detailed station or county forecasts when a user selects a location,
- show hourly and weekly outlooks in a cleaner visual format,
- pass the user question, county, or station ID to the chat assistant.

Real-world example:
On the map, a user clicks a marker near **San Diego**. The frontend uses that `station_id` to request `/api/station/{station_id}` and displays:

- current AQI,
- current PM2.5,
- the next 24 hourly values,
- 7-day forecast values,
- data freshness such as `live`, `recent`, or `stale`.

### End-to-End User Flow

Here is the complete lifecycle of one forecast:

1. A scheduled GitHub Action starts the ETL pipeline every hour.
2. The pipeline fetches live PM2.5 and weather readings.
3. It computes engineered features and runs XGBoost inference.
4. It writes `predictions_latest.json` to Azure Blob Storage.
5. The FastAPI backend loads that file and caches it.
6. The React frontend calls the backend to render the dashboard.
7. If the user asks a question, the chat endpoint attaches the most relevant AQI and forecast context before sending it to Groq.

### Example Scenarios

#### Scenario A: User opens the map

- The frontend calls `/api/stations`.
- The backend reads the latest prediction snapshot.
- Each station is returned with AQI, PM2.5, theme, and freshness.
- The frontend places a color-coded marker on the California map.

What the user experiences:
Someone opening the app can immediately see that **Bay Area markers are mostly green** while parts of the **Central Valley are orange**, without waiting for the browser to compute anything heavy.

#### Scenario B: User checks a county forecast

- The user selects **Fresno County**.
- The frontend calls `/api/forecast/Fresno`.
- The backend groups Fresno stations, calculates an aggregate county PM2.5/AQI, and returns the freshest station's forecast series for the main display.

What the user experiences:
They can answer practical questions like, "Is tomorrow likely to be worse than today in Fresno?" using county-level data backed by actual station forecasts.

#### Scenario C: User asks the AI assistant

- The user asks, "Is it safe to jog tonight in Pasadena?"
- The frontend sends the question plus county or station context to `/api/chat`.
- The backend builds a prompt containing current PM2.5, AQI category, freshness, hourly forecast, and 7-day outlook.
- Groq returns a short answer grounded in the live forecast context.

What the user experiences:
Instead of a generic wellness answer, they get a location-aware response such as whether air quality is improving by evening or staying elevated.

### Why This Architecture Works Well

- **Separation of concerns**: ETL handles forecasting, the backend handles serving, and the frontend handles presentation.
- **Scalability**: heavy model inference runs once per hour, not on every user request.
- **Resilience**: the backend can serve from a local file or Azure Blob Storage.
- **Low latency for users**: the frontend reads precomputed forecasts through lightweight API responses.
- **Explainability**: station-level data, county rollups, and freshness labels make the system easier to trust.

---

## Features

- **43 California counties** with live AQI data from 117 monitoring stations
- **24-hour hourly PM2.5 forecast** powered by XGBoost models
- **7-day AQI outlook** with daily predictions
- **AI chat assistant** — ask about air quality, outdoor activities, health advice (Groq/Llama 3.1)
- **Animated particle background** that changes with AQI theme
- **Fully responsive** — mobile, tablet, desktop
- **Accessible** — ARIA labels, keyboard navigation, reduced motion support

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite 8, CSS-in-JS, Glassmorphism |
| Backend | Python, FastAPI, Uvicorn |
| ML Models | XGBoost (30 models — log + weighted), 50 features |
| Data | AirNow API (PM2.5), OpenMeteo API (weather) |
| AI Chat | Groq API (Llama 3.1 8B Instant) |
| Preprocessing | Pandas, Azure Data Lake |
| Training | XGBoost on 2.1M rows, 118 stations, 2023–2025 |

---

## Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- A Groq API key — [get one here](https://console.groq.com/)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
# Place predictions_latest.json in this folder
uvicorn main:app --reload --port 3001
```

Runs on `http://localhost:3001`

### 2. Frontend

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`

---

## ML Pipeline

The prediction pipeline runs separately (Colab or scheduled):

1. **Data Preprocessing** — cleans raw EPA + NOAA data, engineers 50 features including neighbor-station spatial features
2. **Model Training** — trains 30 XGBoost models (one per forecast horizon: 1h–24h hourly + 7 daily)
3. **Live Inference** — fetches live data from APIs, computes features, runs models, outputs `predictions_latest.json`

### Model Performance

| Horizon | MAE (µg/m³) |
|---------|-------------|
| 1 hour  | 2.34 |
| 6 hours | 2.76 |
| 12 hours | 2.88 |
| 24 hours | 3.01 |
| 7 days  | 3.48 |

Persistence baseline MAE: 4.06 — **25% improvement**.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stations` | GET | List all monitoring stations with current AQI, PM2.5, and freshness |
| `/api/station/{station_id}` | GET | Full forecast for one monitoring station |
| `/api/counties` | GET | List county-level summaries aggregated from stations |
| `/api/forecast/{county}` | GET | County forecast plus the stations that belong to that county |
| `/api/chat` | POST | AI chat with station/county AQI context |
| `/api/health` | GET | Health check and prediction availability |

---

## Team

**Team Nebraska** — Capstone 2025

- Akhilesh Budati
- Amulya Pingili
- Nagalakshmi Cherukuri
- Ramreddy Arolla
- Niharika Ravilla
