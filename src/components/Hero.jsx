import { useEffect, useRef, useState } from 'react';
import { COUNTIES } from '../stubs/data';
import { aqiTheme } from '../utils/aqi';

const COUNTY_NAMES = Object.keys(COUNTIES);

export default function Hero({ county, setCounty, setTheme }) {
  const [mounted, setMounted] = useState(false);
  const dotRef = useRef(null);

  // Stagger animation fires once on mount
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  function switchCounty(name) {
    setCounty(name);
    setTheme(aqiTheme(COUNTIES[name].aqi));
  }

  const data = COUNTIES[county];
  const dotPct = Math.min((data.aqi / 300) * 100, 98);

  return (
    <>
      <style>{`
        .hero-wrap {
          padding: 16px 16px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-card {
          background: rgba(255,255,255,0.11);
          backdrop-filter: blur(32px) saturate(190%);
          -webkit-backdrop-filter: blur(32px) saturate(190%);
          border: 1px solid rgba(255,255,255,0.17);
          border-radius: 20px;
          padding: 32px 36px;
        }

        /* Stagger fade-up layers */
        .hero-row-1,
        .hero-row-2,
        .hero-row-3,
        .hero-row-4 {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .hero-mounted .hero-row-1 { opacity: 1; transform: none; transition-delay: 0ms;   }
        .hero-mounted .hero-row-2 { opacity: 1; transform: none; transition-delay: 150ms; }
        .hero-mounted .hero-row-3 { opacity: 1; transform: none; transition-delay: 300ms; }
        .hero-mounted .hero-row-4 { opacity: 1; transform: none; transition-delay: 450ms; }

        /* Top row */
        .hero-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 28px;
        }
        .hero-county-name {
          font-family: 'Nunito', sans-serif;
          font-weight: 300;
          font-size: 38px;
          color: #ffffff;
          line-height: 1;
        }
        .county-select {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: #ffffff;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 24px;
          padding: 8px 16px;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          outline: none;
          min-width: 160px;
        }
        .county-select:focus-visible {
          outline: 2px solid rgba(255,255,255,0.5);
          outline-offset: 2px;
        }
        .county-select option {
          background: #1a1000;
          color: #fff;
        }

        /* AQI row */
        .hero-aqi-row {
          display: flex;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .hero-aqi-number {
          font-family: 'Nunito', sans-serif;
          font-weight: 200;
          font-size: clamp(64px, 12vw, 96px);
          color: #ffffff;
          line-height: 0.9;
        }
        .hero-aqi-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 8px;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.20);
          border-radius: 24px;
          padding: 5px 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 13px;
          color: #ffffff;
          width: fit-content;
        }
        .hero-pm-line {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: rgba(255,255,255,0.68);
          line-height: 1.5;
        }
        .hero-desc {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-style: italic;
          font-size: 14px;
          color: rgba(255,255,255,0.42);
          max-width: 320px;
          line-height: 1.6;
          margin-top: 4px;
        }

        /* AQI scale */
        .scale-wrap {
          margin: 20px 0 28px;
        }
        .scale-bar-outer {
          position: relative;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, #3a7d44, #fdb515, #e8581a, #c0392b, #7e0023);
        }
        .scale-dot {
          position: absolute;
          top: 50%;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 2px rgba(0,0,0,0.4);
          transition: left 0.9s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .scale-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
        }
        .scale-label {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
        }

        /* Weather pills */
        .weather-pills {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .weather-pill {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pill-label {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .pill-value {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 15px;
          color: rgba(255,255,255,0.90);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-card { padding: 24px 20px; }
          .hero-aqi-row { flex-direction: column; align-items: flex-start; gap: 12px; }
          .weather-pills { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .hero-top { flex-direction: column; align-items: flex-start; }
          .hero-county-name { font-size: 30px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-row-1, .hero-row-2, .hero-row-3, .hero-row-4 {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .scale-dot { transition: none !important; }
        }
      `}</style>

      <div className="hero-wrap">
        <div className={`hero-card${mounted ? ' hero-mounted' : ''}`}>

          {/* Row 1 — county name + select */}
          <div className="hero-row-1">
            <div className="hero-top">
              <h1 className="hero-county-name">{county}</h1>
              <select
                className="county-select"
                value={county}
                onChange={(e) => switchCounty(e.target.value)}
                aria-label="Select county"
              >
                {COUNTY_NAMES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 — AQI number + badge + PM lines */}
          <div className="hero-row-2">
            <div className="hero-aqi-row">
              <div className="hero-aqi-number" aria-label={`AQI ${data.aqi}`}>
                {data.aqi}
              </div>
              <div className="hero-aqi-meta">
                <span className="status-badge">{data.status}</span>
                <p className="hero-pm-line">
                  PM2.5 now <strong>{data.pm} µg/m³</strong>
                </p>
                <p className="hero-pm-line">
                  Tomorrow forecast <strong>{data.tmr} µg/m³</strong>
                </p>
                <p className="hero-desc">{data.desc}</p>
              </div>
            </div>
          </div>

          {/* Row 3 — AQI scale bar */}
          <div className="hero-row-3">
            <div className="scale-wrap">
              <div className="scale-bar-outer" role="img" aria-label={`AQI scale, current value ${data.aqi}`}>
                <div
                  ref={dotRef}
                  className="scale-dot"
                  style={{ left: `${dotPct}%` }}
                />
              </div>
              <div className="scale-labels" aria-hidden="true">
                <span className="scale-label">Good</span>
                <span className="scale-label">Moderate</span>
                <span className="scale-label">Sensitive</span>
                <span className="scale-label">Unhealthy</span>
                <span className="scale-label">Hazardous</span>
              </div>
            </div>
          </div>

          {/* Row 4 — weather pills */}
          <div className="hero-row-4">
            <div className="weather-pills">
              <WeatherPill label="Temp" value={data.temp} />
              <WeatherPill label="Wind" value={data.wind} />
              <WeatherPill label="Humidity" value={data.humidity} />
              <WeatherPill label="Pressure" value={data.pressure} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function WeatherPill({ label, value }) {
  return (
    <div className="weather-pill">
      <span className="pill-label">{label}</span>
      <span className="pill-value">{value}</span>
    </div>
  );
}
