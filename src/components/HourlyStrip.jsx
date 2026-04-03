import { useState } from 'react';
import { COUNTIES } from '../stubs/data';
import { aqiColor } from '../utils/aqi';

const TABS = ['24h', '48h', '72h'];
const MULTIPLIERS = { '24h': 1, '48h': 1.12, '72h': 0.88 };

function getHourLabel(offsetFromNow) {
  if (offsetFromNow === 0) return 'Now';
  const d = new Date();
  d.setHours(d.getHours() + offsetFromNow);
  const h = d.getHours();
  return h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
}

// PM2.5 → approximate AQI (simplified linear for visual purposes)
function pmToAqi(pm) {
  if (pm <= 12)   return Math.round((pm / 12) * 50);
  if (pm <= 35.4) return Math.round(51 + ((pm - 12) / 23.4) * 49);
  if (pm <= 55.4) return Math.round(101 + ((pm - 35.4) / 20) * 49);
  if (pm <= 150.4)return Math.round(151 + ((pm - 55.4) / 95) * 49);
  return Math.round(201 + ((pm - 150.4) / 99.6) * 99);
}

export default function HourlyStrip({ county }) {
  const [tab, setTab] = useState('24h');

  const base = COUNTIES[county]?.hourly ?? [];
  const mult = MULTIPLIERS[tab];
  const hours = base.map((pm) => Math.round(pm * mult * 10) / 10);

  const maxPm = Math.max(...hours, 1);
  const BAR_MAX_H = 36; // px — max bar height

  return (
    <>
      <style>{`
        .hourly-wrap {
          padding: 0 16px 16px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hourly-card {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(22px) saturate(160%);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 20px;
          padding: 20px;
        }
        .hourly-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hourly-label {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 12px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.48);
        }

        /* Tab switcher */
        .tab-switcher {
          display: flex;
          background: rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 3px;
          gap: 2px;
        }
        .tab-btn {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: rgba(255,255,255,0.50);
          background: none;
          border: none;
          border-radius: 18px;
          padding: 5px 14px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          line-height: 1;
        }
        .tab-btn:focus-visible {
          outline: 2px solid rgba(255,255,255,0.5);
          outline-offset: 1px;
        }
        .tab-btn.active {
          background: rgba(255,255,255,0.17);
          color: #ffffff;
          font-weight: 500;
        }

        /* Scroll row */
        .hourly-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.18) transparent;
        }
        .hourly-scroll::-webkit-scrollbar {
          height: 2px;
        }
        .hourly-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .hourly-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.18);
          border-radius: 1px;
        }

        /* Hour card */
        .hour-card {
          flex: 0 0 auto;
          width: 58px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 8px;
          border-radius: 14px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.08);
          transition: background 0.2s, border-color 0.2s;
        }
        .hour-card.now {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.28);
        }
        .hour-time {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 11px;
          color: rgba(255,255,255,0.50);
          white-space: nowrap;
        }
        .hour-card.now .hour-time {
          color: rgba(255,255,255,0.90);
          font-weight: 600;
        }
        .bar-track {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          height: 36px;
        }
        .bar-fill {
          width: 10px;
          border-radius: 3px 3px 0 0;
          min-height: 3px;
          transition: height 0.4s ease, background-color 0.4s ease;
        }
        .hour-pm {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 11px;
          color: rgba(255,255,255,0.65);
          white-space: nowrap;
        }
        .hour-card.now .hour-pm {
          color: rgba(255,255,255,0.90);
        }

        @media (prefers-reduced-motion: reduce) {
          .tab-btn, .bar-fill { transition: none !important; }
        }
      `}</style>

      <div className="hourly-wrap">
        <div className="hourly-card">
          <div className="hourly-header">
            <span className="hourly-label">Hourly PM2.5</span>
            <div className="tab-switcher" role="tablist" aria-label="Forecast range">
              {TABS.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  className={`tab-btn${tab === t ? ' active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="hourly-scroll" role="list">
            {hours.map((pm, i) => {
              const aqi = pmToAqi(pm);
              const barH = Math.max(Math.round((pm / maxPm) * BAR_MAX_H), 3);
              const isNow = i === 0;
              return (
                <div
                  key={i}
                  role="listitem"
                  className={`hour-card${isNow ? ' now' : ''}`}
                  aria-label={`${getHourLabel(i)}: PM2.5 ${pm}`}
                >
                  <span className="hour-time">{getHourLabel(i)}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: barH, backgroundColor: aqiColor(aqi) }}
                    />
                  </div>
                  <span className="hour-pm">{pm}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
