export default function Methodology() {
  return (
    <>
      <style>{`
        .method-page {
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .method-card {
          background: rgba(255,255,255,0.11);
          backdrop-filter: blur(32px) saturate(190%);
          -webkit-backdrop-filter: blur(32px) saturate(190%);
          border: 1px solid rgba(255,255,255,0.17);
          border-radius: 20px;
          padding: 32px 36px;
        }
        .method-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 300;
          font-size: 32px;
          color: #ffffff;
          margin: 0 0 8px;
        }
        .method-intro {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 15px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 700px;
          margin-bottom: 32px;
        }
        .method-section {
          margin-bottom: 32px;
        }
        .method-section:last-child {
          margin-bottom: 0;
        }
        .method-h2 {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 18px;
          color: #ffffff;
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .method-h2-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          flex-shrink: 0;
        }
        .method-p {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin: 0 0 10px;
          padding-left: 38px;
        }
        .method-table-wrap {
          padding-left: 38px;
          overflow-x: auto;
          margin-top: 12px;
        }
        .method-table {
          border-collapse: collapse;
          width: 100%;
          max-width: 600px;
        }
        .method-table th,
        .method-table td {
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          padding: 8px 14px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .method-table th {
          color: rgba(255,255,255,0.5);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 11px;
        }
        .method-table td {
          color: rgba(255,255,255,0.75);
          font-weight: 400;
        }
        .method-table tr:last-child td {
          border-bottom: none;
        }
        .method-highlight {
          color: rgba(255,255,255,0.9);
          font-weight: 500;
        }
        .method-list {
          padding-left: 56px;
          margin: 8px 0;
        }
        .method-list li {
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.8;
        }
        .method-badge {
          display: inline-block;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          padding: 2px 8px;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
        }
        .method-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 28px 0;
        }
        .method-note {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 13px;
          font-style: italic;
          color: rgba(255,255,255,0.35);
          line-height: 1.6;
          padding-left: 38px;
        }
        @media (max-width: 768px) {
          .method-card { padding: 24px 20px; }
          .method-p, .method-note { padding-left: 0; }
          .method-list { padding-left: 20px; }
          .method-table-wrap { padding-left: 0; }
        }
      `}</style>

      <div className="method-page">
        <div className="method-card">
          <h1 className="method-title">Methodology</h1>
          <p className="method-intro">
            Our system forecasts PM2.5 concentrations across California using machine learning
            models trained on 2.1 million hourly observations from 118 monitoring stations
            spanning January 2023 to August 2025.
          </p>

          <div className="method-section">
            <h2 className="method-h2"><span className="method-h2-num">1</span> Data Sources</h2>
            <p className="method-p">
              We integrate two publicly available environmental datasets:
            </p>
            <ul className="method-list">
              <li><span className="method-highlight">EPA AirNow</span> — Hourly PM2.5 concentrations from government monitoring stations across California. Provides real-time and historical particulate matter measurements.</li>
              <li><span className="method-highlight">OpenMeteo / NOAA</span> — Hourly meteorological data including temperature, dew point, pressure, wind speed, wind direction, and precipitation. Weather conditions significantly influence pollutant dispersion and accumulation.</li>
            </ul>
            <p className="method-p">
              Data is matched by geographic proximity — each air quality station is paired with the nearest weather station using haversine distance.
            </p>
          </div>

          <hr className="method-divider" />

          <div className="method-section">
            <h2 className="method-h2"><span className="method-h2-num">2</span> Feature Engineering</h2>
            <p className="method-p">
              We engineer <span className="method-highlight">50 features</span> from the raw data, all backward-looking to prevent data leakage:
            </p>
            <ul className="method-list">
              <li><strong>PM2.5 Lags</strong> — 1h, 2h, 3h, 24h, 48h lookback values</li>
              <li><strong>Rolling Statistics</strong> — Mean, max, and standard deviation over 3h, 6h, 24h, and 168h (7-day) windows</li>
              <li><strong>Weather Lags</strong> — Temperature, wind speed, pressure, precipitation, and dew point at 1h, 24h, and 48h lags</li>
              <li><strong>Time Features</strong> — Cyclical encoding of hour, day-of-week, month; weekend flag; wildfire season flag (Aug–Oct); winter flag (Dec–Feb)</li>
              <li><strong>Spatial Features</strong> — Latitude, longitude, Central Valley flag, coastal flag</li>
              <li><strong>Neighbor-Station Features</strong> — Max and mean PM2.5 from the 5 nearest monitoring stations over 6h and 24h windows, capturing spatial pollution transport patterns</li>
            </ul>
            <p className="method-note">
              The neighbor-station features are inspired by graph neural network approaches to air quality prediction
              (Ye et al., 2025), adapted as simple engineered features compatible with gradient boosting models.
            </p>
          </div>

          <hr className="method-divider" />

          <div className="method-section">
            <h2 className="method-h2"><span className="method-h2-num">3</span> Model Architecture</h2>
            <p className="method-p">
              We use <span className="method-highlight">XGBoost</span> (Extreme Gradient Boosting) with a
              direct multi-output strategy: one model per forecast horizon, each trained on the same 50-feature
              set but predicting a different time step ahead.
            </p>
            <p className="method-p">
              <strong>30 models total:</strong> 24 hourly models (1h → 24h) + 6 daily models (48h → 168h).
            </p>
            <p className="method-p">
              Key training decisions:
            </p>
            <ul className="method-list">
              <li><span className="method-badge">log1p transform</span> — Target values are log-transformed to reduce the influence of extreme spikes and handle the right-skewed PM2.5 distribution</li>
              <li><span className="method-badge">sample weighting</span> — High-pollution events (PM2.5 ≥ 35 µg/m³) receive 8× weight to improve rare event prediction</li>
              <li><span className="method-badge">early stopping</span> — Training stops after 30 rounds without validation improvement to prevent overfitting</li>
              <li><span className="method-badge">chronological split</span> — Train: 2023–2024, Validation: Jan–Apr 2025, Test: May–Aug 2025. No data leakage.</li>
            </ul>
          </div>

          <hr className="method-divider" />

          <div className="method-section">
            <h2 className="method-h2"><span className="method-h2-num">4</span> Model Comparison</h2>
            <p className="method-p">
              We evaluated four model architectures on the same dataset:
            </p>
            <div className="method-table-wrap">
              <table className="method-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>24h MAE</th>
                    <th>High-Pollution MAE</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="method-highlight">Log + Weighted XGBoost</td>
                    <td className="method-highlight">3.01</td>
                    <td>49.3</td>
                    <td>Selected — best overall</td>
                  </tr>
                  <tr>
                    <td>LightGBM</td>
                    <td>3.01</td>
                    <td>49.5</td>
                    <td>Comparable performance</td>
                  </tr>
                  <tr>
                    <td>CatBoost</td>
                    <td>3.00</td>
                    <td>49.5</td>
                    <td>Comparable performance</td>
                  </tr>
                  <tr>
                    <td>BiLSTM + Attention</td>
                    <td>3.11</td>
                    <td>~45</td>
                    <td>Sequence boundary issues</td>
                  </tr>
                  <tr>
                    <td>Gated XGBoost</td>
                    <td>3.09</td>
                    <td>45.1</td>
                    <td>Gate rarely activated</td>
                  </tr>
                  <tr>
                    <td>Persistence Baseline</td>
                    <td>4.06</td>
                    <td>—</td>
                    <td>PM2.5 tomorrow = today</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="method-note">
              All gradient boosting variants converge to similar performance (~3.0 MAE),
              confirming the result is data-bound, not architecture-bound.
            </p>
          </div>

          <hr className="method-divider" />

          <div className="method-section">
            <h2 className="method-h2"><span className="method-h2-num">5</span> Performance by Horizon</h2>
            <div className="method-table-wrap">
              <table className="method-table">
                <thead>
                  <tr>
                    <th>Forecast Horizon</th>
                    <th>MAE (µg/m³)</th>
                    <th>RMSE (µg/m³)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1 hour</td><td className="method-highlight">2.34</td><td>4.45</td></tr>
                  <tr><td>6 hours</td><td>2.76</td><td>5.27</td></tr>
                  <tr><td>12 hours</td><td>2.88</td><td>5.42</td></tr>
                  <tr><td>24 hours</td><td>3.01</td><td>5.58</td></tr>
                  <tr><td>48 hours (Day 2)</td><td>3.24</td><td>5.83</td></tr>
                  <tr><td>72 hours (Day 3)</td><td>3.36</td><td>5.89</td></tr>
                  <tr><td>168 hours (Day 7)</td><td>3.48</td><td>6.11</td></tr>
                </tbody>
              </table>
            </div>
            <p className="method-p">
              The model achieves a <span className="method-highlight">25% improvement</span> over
              the persistence baseline (MAE 3.01 vs 4.06 for 24h horizon). Performance degrades
              gracefully with longer horizons, consistent with the increasing difficulty of
              extended forecasts.
            </p>
          </div>

          <hr className="method-divider" />

          <div className="method-section">
            <h2 className="method-h2"><span className="method-h2-num">6</span> AQI Calculation</h2>
            <p className="method-p">
              The Air Quality Index (AQI) displayed on the dashboard is calculated from predicted
              PM2.5 concentrations using EPA's standard breakpoint formula:
            </p>
            <div className="method-table-wrap">
              <table className="method-table">
                <thead>
                  <tr>
                    <th>PM2.5 (µg/m³)</th>
                    <th>AQI Range</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>0.0 – 12.0</td><td>0 – 50</td><td>Good</td></tr>
                  <tr><td>12.1 – 35.4</td><td>51 – 100</td><td>Moderate</td></tr>
                  <tr><td>35.5 – 55.4</td><td>101 – 150</td><td>Unhealthy for Sensitive Groups</td></tr>
                  <tr><td>55.5 – 150.4</td><td>151 – 200</td><td>Unhealthy</td></tr>
                  <tr><td>150.5 – 250.4</td><td>201 – 300</td><td>Very Unhealthy</td></tr>
                  <tr><td>250.5 – 500.4</td><td>301 – 500</td><td>Hazardous</td></tr>
                </tbody>
              </table>
            </div>
            <p className="method-note">
              Note: The complete EPA AQI considers multiple pollutants (PM2.5, PM10, O3, NO2, SO2, CO)
              and reports the highest sub-index. Our AQI is based on PM2.5 only, as this is the sole
              pollutant predicted by our model.
            </p>
          </div>

          <hr className="method-divider" />

          <div className="method-section">
            <h2 className="method-h2"><span className="method-h2-num">7</span> Known Limitations</h2>
            <ul className="method-list">
              <li><strong>Sudden spike events</strong> — Wildfire smoke can cause PM2.5 to jump from 7 to 300+ µg/m³ within hours. These events are driven by external factors (fire ignition, wind shifts) not present in our feature set. The model predicts the mean well but cannot anticipate sudden-onset events.</li>
              <li><strong>PM2.5-only AQI</strong> — A complete AQI would require predictions for additional pollutants (O3, NO2, etc.) which are not included in this version.</li>
              <li><strong>Data gap</strong> — Training data covers 2023–2025. The model may perform differently for weather patterns not represented in this period.</li>
              <li><strong>Station coverage</strong> — Rural counties with sparse monitoring may have less reliable predictions due to fewer nearby reference stations.</li>
            </ul>
          </div>

          <hr className="method-divider" />

          <div className="method-section">
            <h2 className="method-h2"><span className="method-h2-num">8</span> References</h2>
            <ul className="method-list">
              <li>Makhdoomi et al. (2025). "PM2.5 concentration prediction using machine learning algorithms." <em>Scientific Reports</em>, 15:8076.</li>
              <li>Ye et al. (2025). "A graph neural network and Transformer-based model for PM2.5 prediction through spatiotemporal correlation." <em>Environmental Modelling and Software</em>, 191:106501.</li>
              <li>U.S. EPA. "Technical Assistance Document for the Reporting of Daily Air Quality." EPA-454/B-18-007.</li>
            </ul>
          </div>

        </div>
      </div>
    </>
  );
}
