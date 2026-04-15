import { useEffect, useRef, useState } from 'react';

export default function Hero({ county, stationId, forecast, stationList, onSelect, loading }) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dotRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Build searchable list: individual stations grouped by county
  const filtered = stationList.filter((s) =>
    s.county.toLowerCase().includes(search.toLowerCase())
  );

  // Deduplicate to county level for search dropdown
  const countyMap = {};
  for (const s of filtered) {
    if (!countyMap[s.county] || s.aqi > countyMap[s.county].aqi) {
      countyMap[s.county] = s;
    }
  }
  const filteredCounties = Object.values(countyMap).sort((a, b) => a.county.localeCompare(b.county));

  function selectItem(station) {
    onSelect({ station_id: station.station_id, county: station.county });
    setSearch('');
    setShowDropdown(false);
  }

  const aqi = forecast ? forecast.aqi : 0;
  const pm = forecast ? forecast.pm25 : 0;
  const tmr = forecast ? forecast.tmr : 0;
  const status = forecast ? forecast.status : 'Loading...';
  const desc = forecast ? forecast.desc : '';
  const dotPct = Math.min((aqi / 300) * 100, 98);

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
        .hero-row-1, .hero-row-2, .hero-row-3 {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .hero-mounted .hero-row-1 { opacity: 1; transform: none; transition-delay: 0ms; }
        .hero-mounted .hero-row-2 { opacity: 1; transform: none; transition-delay: 150ms; }
        .hero-mounted .hero-row-3 { opacity: 1; transform: none; transition-delay: 300ms; }
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

        /* Search input */
        .county-search-wrap {
          position: relative;
          min-width: 200px;
        }
        .county-search-input {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: #ffffff;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 24px;
          padding: 9px 16px 9px 36px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .county-search-input::placeholder {
          color: rgba(255,255,255,0.35);
        }
        .county-search-input:focus {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.12);
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.35);
          pointer-events: none;
        }

        /* Dropdown */
        .county-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: rgba(18,22,18,0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 14px;
          max-height: 240px;
          overflow-y: auto;
          z-index: 50;
          padding: 6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.12) transparent;
        }
        .county-dropdown::-webkit-scrollbar { width: 4px; }
        .county-dropdown::-webkit-scrollbar-track { background: transparent; }
        .county-dropdown::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        .county-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.75);
        }
        .county-option:hover {
          background: rgba(255,255,255,0.10);
          color: #ffffff;
        }
        .county-option.active {
          background: rgba(255,255,255,0.14);
          color: #ffffff;
          font-weight: 500;
        }
        .county-option-aqi {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
        }
        .county-no-results {
          padding: 12px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          text-align: center;
        }

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
        .hero-stations {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: rgba(255,255,255,0.28);
          margin-top: 4px;
        }
        .scale-wrap { margin: 20px 0 28px; }
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
        @media (max-width: 768px) {
          .hero-card { padding: 24px 20px; }
          .hero-aqi-row { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
        @media (max-width: 480px) {
          .hero-top { flex-direction: column; align-items: flex-start; }
          .hero-county-name { font-size: 30px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-row-1, .hero-row-2, .hero-row-3 {
            opacity: 1 !important; transform: none !important; transition: none !important;
          }
          .scale-dot { transition: none !important; }
        }
      `}</style>

      <div className="hero-wrap">
        <div className={`hero-card${mounted ? ' hero-mounted' : ''}`}>

          <div className="hero-row-1">
            <div className="hero-top">
              <h1 className="hero-county-name">{county}</h1>
              <div className="county-search-wrap">
                <span className="search-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="10.5" y1="10.5" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  ref={searchRef}
                  className="county-search-input"
                  type="text"
                  placeholder="Search location..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  aria-label="Search location"
                />
                {showDropdown && (
                  <div className="county-dropdown" ref={dropdownRef}>
                    {filteredCounties.length === 0 ? (
                      <div className="county-no-results">No locations found</div>
                    ) : (
                      filteredCounties.map((s) => (
                        <div
                          key={s.station_id}
                          className={`county-option${s.county === county ? ' active' : ''}`}
                          onClick={() => selectItem(s)}
                        >
                          <span>{s.county}</span>
                          <span className="county-option-aqi">AQI {s.aqi}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hero-row-2">
            <div className="hero-aqi-row">
              <div className="hero-aqi-number" aria-label={`AQI ${aqi}`}>
                {loading ? '—' : aqi}
              </div>
              <div className="hero-aqi-meta">
                <span className="status-badge">{status}</span>
                <p className="hero-pm-line">PM2.5 now <strong>{pm} µg/m³</strong></p>
                <p className="hero-pm-line">Tomorrow forecast <strong>{tmr} µg/m³</strong></p>
                <p className="hero-desc">{desc}</p>
                {forecast && forecast.freshness && (
                  <p className="hero-stations" style={{
                    color: forecast.freshness === 'live' ? 'rgba(100,220,100,0.6)' :
                           forecast.freshness === 'recent' ? 'rgba(253,181,21,0.5)' :
                           'rgba(255,100,100,0.5)'
                  }}>
                    {forecast.freshness === 'live' ? '● Live' :
                     forecast.freshness === 'recent' ? '● Updated recently' :
                     '● Data may be stale'}
                  </p>
                )}
                {forecast && forecast.n_stations && (
                  <p className="hero-stations">{forecast.n_stations} monitoring stations</p>
                )}
              </div>
            </div>
          </div>

          <div className="hero-row-3">
            <div className="scale-wrap">
              <div className="scale-bar-outer" role="img" aria-label={`AQI scale, current value ${aqi}`}>
                <div ref={dotRef} className="scale-dot" style={{ left: `${dotPct}%` }} />
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

        </div>
      </div>
    </>
  );
}
