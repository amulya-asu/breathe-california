const SOURCES = ['EPA AQS', 'NOAA ISD', 'Azure Data Lake'];

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-wrap {
          padding: 0 16px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-card {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(22px) saturate(160%);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 20px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .footer-left {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: rgba(255,255,255,0.28);
          white-space: nowrap;
        }
        .footer-sources {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .footer-source {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: rgba(255,255,255,0.28);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-source:hover      { color: rgba(255,255,255,0.60); }
        .footer-source:focus-visible {
          outline: 2px solid rgba(255,255,255,0.4);
          outline-offset: 3px;
          border-radius: 3px;
        }

        @media (max-width: 600px) {
          .footer-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .footer-sources { justify-content: center; }
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-source { transition: none; }
        }
      `}</style>

      <footer className="footer-wrap">
        <div className="footer-card">
          <span className="footer-left">
            CA AQI Forecast &nbsp;·&nbsp; Team Nebraska &nbsp;·&nbsp; ASU &nbsp;·&nbsp; 2026
          </span>
          <nav className="footer-sources" aria-label="Data sources">
            {SOURCES.map((s) => (
              <a key={s} href="#" className="footer-source">{s}</a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
