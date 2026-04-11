/**
 * API client for Breathe California backend.
 * Replaces stubs/data.js with live data from FastAPI.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchCounties() {
  const res = await fetch(`${API_BASE}/api/counties`);
  if (!res.ok) throw new Error('Failed to fetch counties');
  const data = await res.json();
  return data;
}

export async function fetchForecast(county) {
  const res = await fetch(`${API_BASE}/api/forecast/${encodeURIComponent(county)}`);
  if (!res.ok) throw new Error(`Failed to fetch forecast for ${county}`);
  return res.json();
}

export async function sendChat(message, county) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, county }),
  });
  if (!res.ok) throw new Error('Chat request failed');
  const data = await res.json();
  return data.reply;
}
