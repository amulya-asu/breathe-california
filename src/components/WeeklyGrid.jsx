import { WEEKLY } from '../stubs/data';
import { aqiColor } from '../utils/aqi';

export default function WeeklyGrid({ county }) {
  const days = WEEKLY[county] ?? [];

  return (
    <>
      <style>{`
        .weekly-wrap {
          padding: 0 16px 16px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .weekly-card {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(22px) saturate(160%);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 20px;
          padding: 20px;
        }
        .weekly-section-label {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 12px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.48);
          margin-bottom: 14px;
        }
        .weekly-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        .day-card {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .day-card.today {
          background: rgba(255,255,255,0.16);
          border-color: rgba(255,255,255,0.24);
        }
        .day-name {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 12px;
          color: rgba(255,255,255,0.48);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .day-card.today .day-name {
          color: rgba(255,255,255,0.80);
        }
        .day-aqi {
          font-family: 'Nunito', sans-serif;
          font-weight: 200;
          font-size: 26px;
          color: #ffffff;
          line-height: 1;
        }
        .day-range {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 10px;
          color: rgba(255,255,255,0.38);
          white-space: nowrap;
        }
        .day-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Tablet: 4+3 natural wrap */
        @media (max-width: 900px) {
          .weekly-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        /* Mobile: 2 col */
        @media (max-width: 480px) {
          .weekly-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="weekly-wrap">
        <div className="weekly-card">
          <p className="weekly-section-label">7-Day Outlook</p>
          <div className="weekly-grid" role="list">
            {days.map((d, i) => (
              <div
                key={d.day}
                role="listitem"
                className={`day-card${i === 0 ? ' today' : ''}`}
                aria-label={`${d.day}: AQI ${d.aqi}, PM2.5 ${d.lo}–${d.hi} µg/m³`}
              >
                <span className="day-name">{d.day}</span>
                <span className="day-aqi">{d.aqi}</span>
                <span className="day-range">{d.lo}–{d.hi} µg</span>
                <div
                  className="day-dot"
                  style={{ background: aqiColor(d.aqi) }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
