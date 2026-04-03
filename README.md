# Breathe California — AQI Forecast Dashboard

Real-time air quality forecast dashboard for California counties. Built with React + Vite on the frontend and Express + Anthropic Claude on the backend.

---

## Prerequisites

- Node.js 18+
- An Anthropic API key — [get one here](https://console.anthropic.com/)

---

## Project Structure

```
breathe-california/
├── frontend/   ← React + Vite app
└── backend/    ← Express proxy for Claude API
```

---

## Setup

### 1. Frontend

```bash
cd frontend
npm install
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Open `backend/.env` and add your API key:

```
ANTHROPIC_API_KEY=your-api-key-here
PORT=3001
```

---

## Running Locally

You need **two terminals** running at the same time.

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

Runs on `http://localhost:3001`

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Runs on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

> The frontend proxies all `/api` requests to the backend automatically. The API key is never exposed to the browser.

---

## Features

- Animated particle background that changes with AQI theme
- 7 California counties with live stub data (Fresno, LA, SF, Bakersfield, Sacramento, San Diego, Riverside)
- Hourly PM2.5 strip with 24h / 48h / 72h forecast tabs
- 7-day outlook grid
- AI chat assistant powered by Claude (falls back to stub responses if backend is offline)
- Fully responsive — mobile, tablet, desktop

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite 8, Framer Motion |
| Styling | CSS-in-JS (inline + `<style>` blocks), Glassmorphism |
| Backend | Node.js, Express 4, Anthropic SDK |
| Data | Stub data (EPA AQS / NOAA ISD / Azure Data Lake integration planned) |
