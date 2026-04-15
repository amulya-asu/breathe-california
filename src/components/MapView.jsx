import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { aqiColor } from '../utils/aqi';
import 'leaflet/dist/leaflet.css';

const CA_CENTER = [37.2, -119.5];
const CA_ZOOM = 6;

const REGION_VIEWS = [
  { label: 'All California', center: [37.2, -119.5], zoom: 6 },
  { label: 'Bay Area', center: [37.6, -122.2], zoom: 9 },
  { label: 'LA Basin', center: [34.0, -118.0], zoom: 9 },
  { label: 'Central Valley', center: [36.5, -119.8], zoom: 8 },
  { label: 'San Diego', center: [32.9, -117.0], zoom: 9 },
];

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ stationList, onSelectStation }) {
  const [flyTarget, setFlyTarget] = useState(null);

  const markers = stationList.map((s) => ({
    ...s,
    lat: s.latitude,
    lon: s.longitude,
  }));

  function freshnessColor(freshness) {
    if (freshness === 'live') return 'rgba(100,220,100,0.9)';
    if (freshness === 'recent') return 'rgba(253,181,21,0.9)';
    return 'rgba(255,100,100,0.7)';
  }

  return (
    <>
      <style>{`
        .map-page { padding: 16px; max-width: 1200px; margin: 0 auto; }
        .map-card {
          background: rgba(255,255,255,0.11);
          backdrop-filter: blur(32px) saturate(190%);
          -webkit-backdrop-filter: blur(32px) saturate(190%);
          border: 1px solid rgba(255,255,255,0.17);
          border-radius: 20px; padding: 20px; overflow: hidden;
        }
        .map-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .map-title { font-family: 'Nunito', sans-serif; font-weight: 300; font-size: 28px; color: #ffffff; margin: 0; }
        .map-subtitle { font-family: 'Nunito', sans-serif; font-weight: 400; font-size: 13px; color: rgba(255,255,255,0.48); margin-top: 4px; }
        .map-updated { font-family: 'Nunito', sans-serif; font-weight: 400; font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .map-updated-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #3a7d44; margin-right: 6px; animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .region-btns { display: flex; gap: 6px; flex-wrap: wrap; }
        .region-btn { font-family: 'Nunito', sans-serif; font-weight: 400; font-size: 12px; color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 5px 12px; cursor: pointer; transition: background 0.2s, color 0.2s; }
        .region-btn:hover { background: rgba(255,255,255,0.18); color: #ffffff; }
        .map-container { border-radius: 14px; overflow: hidden; height: 520px; }
        .map-container .leaflet-container { height: 100%; width: 100%; background: #1a2332; }
        .leaflet-popup-content-wrapper { background: rgba(20,25,35,0.95) !important; border: 1px solid rgba(255,255,255,0.15) !important; border-radius: 12px !important; color: #ffffff !important; font-family: 'Nunito', sans-serif; }
        .leaflet-popup-tip { background: rgba(20,25,35,0.95) !important; }
        .leaflet-tooltip { background: rgba(20,25,35,0.85) !important; border: 1px solid rgba(255,255,255,0.15) !important; border-radius: 8px !important; color: #ffffff !important; font-family: 'Nunito', sans-serif; font-size: 12px !important; padding: 4px 8px !important; }
        .leaflet-tooltip-top:before { border-top-color: rgba(20,25,35,0.85) !important; }
        .popup-county { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
        .popup-aqi { font-size: 28px; font-weight: 200; line-height: 1; margin-bottom: 4px; }
        .popup-status { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
        .popup-pm25 { font-size: 13px; color: rgba(255,255,255,0.7); }
        .popup-freshness { font-size: 11px; margin-top: 4px; }
        .popup-btn { margin-top: 8px; padding: 6px 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; color: #ffffff; font-family: 'Nunito', sans-serif; font-size: 12px; cursor: pointer; width: 100%; }
        .popup-btn:hover { background: rgba(255,255,255,0.25); }
        .map-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; flex-wrap: wrap; gap: 10px; }
        .map-legend { display: flex; gap: 16px; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-family: 'Nunito', sans-serif; font-size: 12px; color: rgba(255,255,255,0.55); }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .map-stats { font-family: 'Nunito', sans-serif; font-size: 12px; color: rgba(255,255,255,0.35); }
        .map-loading { display: flex; align-items: center; justify-content: center; height: 520px; font-family: 'Nunito', sans-serif; color: rgba(255,255,255,0.5); font-size: 16px; }
        @media (max-width: 768px) { .map-container { height: 400px; } .map-header { flex-direction: column; } }
      `}</style>

      <div className="map-page">
        <div className="map-card">
          <div className="map-header">
            <div>
              <h2 className="map-title">California Air Quality Map</h2>
              <p className="map-subtitle">{markers.length} monitoring stations with live AQI data</p>
            </div>
            <div className="region-btns">
              {REGION_VIEWS.map((r) => (
                <button key={r.label} className="region-btn" onClick={() => setFlyTarget(r)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {markers.length === 0 ? (
            <div className="map-loading">Loading map data...</div>
          ) : (
            <>
              <div className="map-container">
                <MapContainer center={CA_CENTER} zoom={CA_ZOOM} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {flyTarget && <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}
                  {markers.map((m) => (
                    <CircleMarker
                      key={m.station_id}
                      center={[m.lat, m.lon]}
                      radius={Math.max(6, Math.min(m.aqi / 5, 18))}
                      fillColor={aqiColor(m.aqi)}
                      fillOpacity={m.freshness === 'stale' ? 0.4 : 0.8}
                      stroke={true}
                      color={m.freshness === 'stale' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}
                      weight={1}
                    >
                      <Tooltip direction="top" offset={[0, -8]}>
                        {m.county} — AQI {m.aqi}
                      </Tooltip>
                      <Popup>
                        <div>
                          <div className="popup-county">{m.county}</div>
                          <div className="popup-aqi" style={{ color: aqiColor(m.aqi) }}>{m.aqi}</div>
                          <div className="popup-status">{m.status}</div>
                          <div className="popup-pm25">PM2.5: {m.pm25} µg/m³</div>
                          <div className="popup-freshness" style={{ color: freshnessColor(m.freshness) }}>
                            {m.freshness === 'live' ? '● Live data' :
                             m.freshness === 'recent' ? '● Updated recently' :
                             '● Data may be stale'}
                          </div>
                          {onSelectStation && (
                            <button className="popup-btn" onClick={() => onSelectStation(m.station_id, m.county)}>
                              View Forecast →
                            </button>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              <div className="map-bottom">
                <div className="map-legend">
                  <div className="legend-item"><div className="legend-dot" style={{ background: aqiColor(25) }} />Good (0–50)</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: aqiColor(75) }} />Moderate (51–100)</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: aqiColor(125) }} />Sensitive (101–150)</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: aqiColor(175) }} />Unhealthy (151–200)</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: aqiColor(250) }} />Hazardous (201+)</div>
                </div>
                <div className="map-stats">{markers.length} monitoring stations across California</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
