export default function About() {
  const team = [
    { name: 'Akhilesh Budati', role: 'Data Engineering, Backend Setup & System Architecture' },
    { name: 'Amulya Pingili', role: 'Azure Setup, Live Data Merging & Frontend Setup' },
    { name: 'Niharika Ravilla', role: 'Data Cleaning & Feature Engineering' },
    { name: 'Nagalakshmi Cherukuri', role: 'Data Extraction, Model Training & Testing' },
    { name: 'Ramreddy Arolla', role: 'ETL Pipeline Setup & Azure Deployment' },
  ];

  return (
    <>
      <style>{`
        .about-page {
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .about-card {
          background: rgba(255,255,255,0.11);
          backdrop-filter: blur(32px) saturate(190%);
          -webkit-backdrop-filter: blur(32px) saturate(190%);
          border: 1px solid rgba(255,255,255,0.17);
          border-radius: 20px;
          padding: 32px 36px;
        }
        .about-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 300;
          font-size: 32px;
          color: #ffffff;
          margin: 0 0 8px;
        }
        .about-subtitle {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 15px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 700px;
          margin-bottom: 32px;
        }
        .about-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 28px 0;
        }
        .about-h2 {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 18px;
          color: #ffffff;
          margin: 0 0 16px;
        }
        .about-p {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin: 0 0 10px;
        }
        .about-link {
          color: rgba(255,255,255,0.8);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .about-link:hover {
          color: #ffffff;
        }

        /* Team grid */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }
        .team-member {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .team-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: rgba(255,255,255,0.6);
          flex-shrink: 0;
        }
        .team-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .team-name {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 15px;
          color: #ffffff;
        }
        .team-role {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
        }

        /* Course info */
        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .course-item {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 16px 18px;
        }
        .course-label {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 4px;
        }
        .course-value {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 15px;
          color: rgba(255,255,255,0.85);
        }

        /* Tech stack */
        .stack-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .stack-tag {
          display: inline-block;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 6px 14px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          font-weight: 400;
        }

        /* Data sources */
        .source-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .source-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.55);
        }
        .source-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(58,125,68,0.8);
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .about-card { padding: 24px 20px; }
          .team-grid { grid-template-columns: 1fr; }
          .course-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="about-page">
        <div className="about-card">
          <h1 className="about-title">About This Project</h1>
          <p className="about-subtitle">
            Breathe California is an end-to-end air quality forecasting and decision support system
            built as a capstone project at Arizona State University. It predicts PM2.5 concentrations
            across 117 California monitoring stations using machine learning, and presents the results through an
            interactive web dashboard with AI-powered health guidance.
          </p>

          <hr className="about-divider" />

          <h2 className="about-h2">Course Information</h2>
          <div className="course-grid">
            <div className="course-item">
              <div className="course-label">Course</div>
              <div className="course-value">FSE 570 — Data Science Capstone</div>
            </div>
            <div className="course-item">
              <div className="course-label">Professor</div>
              <div className="course-value">Joshua Loughman</div>
            </div>
            <div className="course-item">
              <div className="course-label">University</div>
              <div className="course-value">Arizona State University</div>
            </div>
            <div className="course-item">
              <div className="course-label">Semester</div>
              <div className="course-value">Spring 2026</div>
            </div>
          </div>

          <hr className="about-divider" />

          <h2 className="about-h2">Team Nebraska</h2>
          <div className="team-grid">
            {team.map((m) => (
              <div className="team-member" key={m.name}>
                <div className="team-avatar">
                  {m.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="team-info">
                  <span className="team-name">{m.name}</span>
                  <span className="team-role">{m.role}</span>
                </div>
              </div>
            ))}
          </div>

          <hr className="about-divider" />

          <h2 className="about-h2">Technology Stack</h2>
          <div className="stack-grid">
            <span className="stack-tag">React 19</span>
            <span className="stack-tag">Vite</span>
            <span className="stack-tag">FastAPI</span>
            <span className="stack-tag">Python</span>
            <span className="stack-tag">XGBoost</span>
            <span className="stack-tag">Pandas</span>
            <span className="stack-tag">Azure Data Lake</span>
            <span className="stack-tag">AirNow API</span>
            <span className="stack-tag">OpenMeteo API</span>
            <span className="stack-tag">Groq / Llama 3.1</span>
            <span className="stack-tag">Leaflet.js</span>
            <span className="stack-tag">Docker</span>
          </div>

          <hr className="about-divider" />

          <h2 className="about-h2">Data Sources</h2>
          <ul className="source-list">
            <li className="source-item"><span className="source-dot" />EPA AirNow — Real-time and historical PM2.5 monitoring data</li>
            <li className="source-item"><span className="source-dot" />OpenMeteo — Historical and current meteorological observations</li>
            <li className="source-item"><span className="source-dot" />NOAA GHCN-Daily — Daily weather observations for model training</li>
            <li className="source-item"><span className="source-dot" />Azure Data Lake — Cloud storage for processed datasets</li>
          </ul>

          <hr className="about-divider" />

          <h2 className="about-h2">Project Highlights</h2>
          <about className="about-p">
            <ul className="source-list">
              <li className="source-item"><span className="source-dot" />2.1 million hourly observations across 118 monitoring stations</li>
              <li className="source-item"><span className="source-dot" />50 engineered features including spatial neighbor-station transport</li>
              <li className="source-item"><span className="source-dot" />30 XGBoost models — one per forecast horizon (1h to 7 days)</li>
              <li className="source-item"><span className="source-dot" />25% improvement over persistence baseline (MAE 3.01 vs 4.06)</li>
              <li className="source-item"><span className="source-dot" />Live inference pipeline with 7-day bootstrap and hourly updates</li>
              <li className="source-item"><span className="source-dot" />AI-powered chat assistant with real-time AQI context</li>
            </ul>
          </about>

          <hr className="about-divider" />

          <h2 className="about-h2">Source Code</h2>
          <p className="about-p">
            The complete source code is available on GitHub:{' '}
            <a
              className="about-link"
              href="https://github.com/amulya-asu/breathe-california"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/amulya-asu/breathe-california
            </a>
          </p>

        </div>
      </div>
    </>
  );
}
