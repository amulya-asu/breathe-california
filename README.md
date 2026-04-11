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
