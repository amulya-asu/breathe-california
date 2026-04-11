import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { fetchCounties } from '../api';
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

function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = markers.map((m) => [m.lat, m.lon]);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [markers, map]);
  return null;
}

function ZoomTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ onSelectCounty }) {
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [generatedAt, setGeneratedAt] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);

  useEffect(() => {
    fetchCounties()
      .then((data) => {
        setCounties(data.counties || []);
        setGeneratedAt(data.generated_at || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (counties.length === 0) return;

    const COUNTY_COORDS = {
      'Alameda': [37.65, -121.90], 'Butte': [39.67, -121.60],
      'Calaveras': [38.20, -120.68], 'Colusa': [39.10, -122.00],
      'Contra Costa': [37.95, -122.02], 'Fresno': [36.75, -119.77],
      'Humboldt': [40.88, -123.98], 'Imperial': [32.84, -115.57],
      'Inyo': [36.97, -118.11], 'Kern': [35.35, -118.70],
      'Kings': [36.21, -119.60], 'Los Angeles': [34.05, -118.24],
      'Madera': [36.96, -120.03], 'Marin': [38.05, -122.75],
      'Mendocino': [39.27, -123.28], 'Merced': [37.30, -120.48],
      'Mono': [37.96, -119.12], 'Monterey': [36.44, -121.49],
      'Nevada': [39.28, -120.62], 'Orange': [33.74, -117.87],
      'Placer': [38.84, -121.18], 'Plumas': [39.88, -120.71],
      'Riverside': [33.88, -117.22], 'Sacramento': [38.58, -121.49],
      'San Benito': [36.84, -121.36], 'San Bernardino': [34.27, -117.29],
      'San Diego': [32.88, -117.07], 'San Francisco': [37.77, -122.42],
      'San Joaquin': [37.88, -121.26], 'San Luis': [35.26, -120.64],
      'San Luis Obispo': [35.26, -120.64], 'San Mateo': [37.48, -122.20],
      'Santa Barbara': [34.57, -119.85], 'Santa Clara': [37.35, -121.85],
      'Santa Cruz': [36.97, -122.03], 'Shasta': [40.55, -122.38],
      'Siskiyou': [41.73, -122.63], 'Solano': [38.27, -121.94],
      'Sonoma': [38.40, -122.82], 'Stanislaus': [37.56, -120.92],
      'Sutter': [39.14, -121.62], 'Tehama': [40.17, -122.26],
      'Tulare': [36.40, -119.31], 'Ventura': [34.35, -119.05],
      'Yolo': [38.66, -121.73],
    };

    const mapped = counties.map((c) => {
      const coords = COUNTY_COORDS[c.county];
      if (!coords) return null;
      return {
        county: c.county,
        aqi: c.aqi,
        pm25: c.pm25,
        status: c.status,
        theme: c.theme,
        lat: coords[0],
        lon: coords[1],
      };
    }).filter(Boolean);

    setMarkers(mapped);
  }, [counties]);

  function formatTime(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
        hour12: true,
      }) + ' PT';
    } catch {
      return '';
    }
  }

  return (
    <>
      <style>{`
        .map-page {
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .map-card {
          background: rgba(255,255,255,0.11);
          backdrop-filter: blur(32px) saturate(190%);
          -webkit-backdrop-filter: blur(32px) saturate(190%);
          border: 1px solid rgba(255,255,255,0.17);
          border-radius: 20px;
          padding: 20px;
          overflow: hidden;
        }
        .map-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .map-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 300;
          font-size: 28px;
          color: #ffffff;
          margin: 0;
        }
        .map-subtitle {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: rgba(255,255,255,0.48);
          margin-top: 4px;
        }
        .map-updated {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-top: 2px;
        }
        .map-updated-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3a7d44;
          margin-right: 6px;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .region-btns {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .region-btn {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 5px 12px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .region-btn:hover {
          background: rgba(255,255,255,0.18);
          color: #ffffff;
        }
        .map-container {
          border-radius: 14px;
          overflow: hidden;
          height: 500px;
        }
        .map-container .leaflet-container {
          height: 100%;
          width: 100%;
          background: #1a2332;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(20,25,35,0.95) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 12px !important;
          color: #ffffff !important;
          font-family: 'Nunito', sans-serif;
        }
        .leaflet-popup-tip {
          background: rgba(20,25,35,0.95) !important;
        }
        .leaflet-tooltip {
          background: rgba(20,25,35,0.85) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 8px !important;
          color: #ffffff !important;
          font-family: 'Nunito', sans-serif;
          font-size: 12px !important;
          padding: 4px 8px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: rgba(20,25,35,0.85) !important;
        }
        .popup-county {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }
        .popup-aqi {
          font-size: 28px;
          font-weight: 200;
          line-height: 1;
          margin-bottom: 4px;
        }
        .popup-status {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 6px;
        }
        .popup-pm25 {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
        }
        .popup-btn {
          margin-top: 8px;
          padding: 6px 14px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          color: #ffffff;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          cursor: pointer;
          width: 100%;
        }
        .popup-btn:hover {
          background: rgba(255,255,255,0.25);
        }
        .map-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 14px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .map-legend {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.55);
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .map-stats {
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
        }
        .map-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 500px;
          font-family: 'Nunito', sans-serif;
          color: rgba(255,255,255,0.5);
          font-size: 16px;
        }
        @media (max-width: 768px) {
          .map-container { height: 380px; }
          .map-header { flex-direction: column; }
        }
      `}</style>

      <div className="map-page">
        <div className="map-card">
          <div className="map-header">
            <div>
              <h2 className="map-title">California Air Quality Map</h2>
              <p className="map-subtitle">
                {markers.length} counties with live AQI data
              </p>
              {generatedAt && (
                <p className="map-updated">
                  <span className="map-updated-dot" />
                  Last updated: {formatTime(generatedAt)}
                </p>
              )}
            </div>
            <div className="region-btns">
              {REGION_VIEWS.map((r) => (
                <button
                  key={r.label}
                  className="region-btn"
                  onClick={() => setFlyTarget(r)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="map-loading">Loading map data...</div>
          ) : (
            <>
              <div className="map-container">
                <MapContainer
                  center={CA_CENTER}
                  zoom={CA_ZOOM}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {!flyTarget && <FitBounds markers={markers} />}
                  {flyTarget && <ZoomTo center={flyTarget.center} zoom={flyTarget.zoom} />}
                  {markers.map((m) => (
                    <CircleMarker
                      key={m.county}
                      center={[m.lat, m.lon]}
                      radius={Math.max(8, Math.min(m.aqi / 4, 22))}
                      fillColor={aqiColor(m.aqi)}
                      fillOpacity={0.8}
                      stroke={true}
                      color="rgba(255,255,255,0.3)"
                      weight={1}
                    >
                      <Tooltip direction="top" offset={[0, -8]} permanent={false}>
                        {m.county} — AQI {m.aqi}
                      </Tooltip>
                      <Popup>
                        <div>
                          <div className="popup-county">{m.county}</div>
                          <div className="popup-aqi" style={{ color: aqiColor(m.aqi) }}>
                            {m.aqi}
                          </div>
                          <div className="popup-status">{m.status}</div>
                          <div className="popup-pm25">PM2.5: {m.pm25} µg/m³</div>
                          {onSelectCounty && (
                            <button
                              className="popup-btn"
                              onClick={() => onSelectCounty(m.county)}
                            >
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
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: aqiColor(25) }} />
                    Good (0–50)
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: aqiColor(75) }} />
                    Moderate (51–100)
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: aqiColor(125) }} />
                    Sensitive (101–150)
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: aqiColor(175) }} />
                    Unhealthy (151–200)
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: aqiColor(250) }} />
                    Hazardous (201+)
                  </div>
                </div>
                <div className="map-stats">
                  117 monitoring stations across California
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
