# Breathe California — AQI Forecast Dashboard

Real-time air quality forecast dashboard for California counties. Powered by live data from AirNow + OpenMeteo, XGBoost ML models, and a FastAPI backend with Groq-powered AI chat.

---

## Architecture

```
AirNow API + OpenMeteo API
        │
        ▼
  Inference Pipeline (Merge_Data.ipynb)
  - Fetches live PM2.5 + weather
  - Computes 50 engineered features
  - Runs 30 XGBoost models
  - Outputs predictions_latest.json
        │
        ▼
  FastAPI Backend (Python)
  - GET  /api/counties        → all counties with AQI
  - GET  /api/forecast/:county → hourly + 7-day forecast
  - POST /api/chat            → AI assistant (Groq/Llama 3.1)
        │
        ▼
  React Frontend (Vite)
  - Glassmorphism UI
  - 43 California counties
  - 24-hour PM2.5 strip
  - 7-day AQI outlook
  - AI chat assistant
```

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

- Python 3.12+
- Node.js 20+
- A Groq API key — [get one here](https://console.groq.com/)
- (Optional) An AirNow API key — [get one here](https://docs.airnowapi.org/)

---

### Quick Start — Frontend Only (no local backend)

If you only want to run the UI locally against the deployed production backend:

```bash
git clone https://github.com/amulya-asu/breathe-california.git
cd breathe-california
npm install

# Create .env.local (overrides .env.production for dev)
echo "VITE_API_URL=https://breathe-api.kindsky-8919ccb9.eastus.azurecontainerapps.io" > .env.local

npm run dev
```

Open `http://localhost:5173`. Done — no Python/Azure setup needed.

---

### Full Local Setup — Backend + Frontend

The backend needs `predictions_latest.json` (generated hourly by the ETL, stored in Azure Blob).

**Step 1 — Backend:**

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

**Step 2 — Get `predictions_latest.json`** (choose one):

Option A — Ask a teammate to send you the file, place it in `backend/`.

Option B — Download from Azure Blob (requires Azure account access):
```bash
az login
az storage blob download \
  --account-name aqidatalake \
  --container-name predictions \
  --name predictions_latest.json \
  --file backend/predictions_latest.json \
  --auth-mode login
```

Option C — Let the backend auto-fetch from Azure. Add to `backend/.env`:
```
AZURE_STORAGE_ACCOUNT=aqidatalake
AZURE_STORAGE_KEY=<the_storage_key>
AZURE_BLOB_CONTAINER=predictions
```

**Step 3 — Run backend:**
```bash
cd backend
uvicorn main:app --reload --port 3001
```
Runs on `http://localhost:3001`

**Step 4 — Run frontend:**
```bash
cd ..
npm install
echo "VITE_API_URL=http://localhost:3001" > .env.local
npm run dev
```
Runs on `http://localhost:5173`

---

### Running the ETL Pipeline Locally (optional)

Only needed if you want to regenerate `predictions_latest.json` yourself. This is normally done by GitHub Actions hourly.

```bash
cd etl
pip install -r requirements.txt

# Set required env vars
export AZURE_STORAGE_ACCOUNT=aqidatalake
export AZURE_STORAGE_KEY=<key>
export AZURE_BLOB_CONTAINER=predictions
export AIRNOW_API_KEY=<your_airnow_key>

python run_pipeline.py
```

Takes 1-5 minutes. Downloads stations.csv + 30 XGBoost models + history from Azure, fetches live AirNow + OpenMeteo data, runs inference, uploads new `predictions_latest.json`.

---

### Troubleshooting

**"predictions_latest.json not found"** — see Step 2 above. The file is not in git because it's generated hourly.

**"AuthorizationFailed" on `az` commands** — your Azure account doesn't have access to the `aqidatalake` storage account. Ask the team lead to add you as `Storage Blob Data Reader`.

**Backend returns 503 "No predictions available"** — either place `predictions_latest.json` in `backend/`, or configure Azure credentials in `.env`.

**Frontend shows "Failed to fetch"** — check `VITE_API_URL` in `.env.local` points to a running backend.

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
| `/api/counties` | GET | List all counties with current AQI |
| `/api/forecast/{county}` | GET | Full forecast for a county |
| `/api/chat` | POST | AI chat with AQI context |
| `/api/health` | GET | Health check |

---

## Team

**Team Nebraska** — Capstone 2025

- Akhilesh Budati
- Amulya Pingili
- Nagalakshmi Cherukuri
- Ramreddy Arolla
- Niharika Ravilla
