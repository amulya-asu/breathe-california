/**
 * API client for Breathe California backend.
 * Supports both station-level and county-level data.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchStations() {
  const res = await fetch(`${API_BASE}/api/stations`);
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
}

export async function fetchStationForecast(stationId) {
  const res = await fetch(`${API_BASE}/api/station/${encodeURIComponent(stationId)}`);
  if (!res.ok) throw new Error(`Failed to fetch forecast for station ${stationId}`);
  return res.json();
}

export async function fetchCounties() {
  const res = await fetch(`${API_BASE}/api/counties`);
  if (!res.ok) throw new Error('Failed to fetch counties');
  return res.json();
}

export async function fetchForecast(county) {
  const res = await fetch(`${API_BASE}/api/forecast/${encodeURIComponent(county)}`);
  if (!res.ok) throw new Error(`Failed to fetch forecast for ${county}`);
  return res.json();
}

export async function sendChat(message, county, stationId) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, county, station_id: stationId }),
  });
  if (!res.ok) throw new Error('Chat request failed');
  const data = await res.json();
  return data.reply;
}
