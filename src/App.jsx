import { useState, useEffect } from 'react';
import Background from './components/Background';
import Nav from './components/Nav';
import Hero from './components/Hero';
import HourlyStrip from './components/HourlyStrip';
import WeeklyGrid from './components/WeeklyGrid';
import ChatBar from './components/ChatBar';
import MapView from './components/MapView';
import Methodology from './components/Methodology';
import About from './components/About';
import Footer from './components/Footer';
import { aqiTheme } from './utils/aqi';
import { fetchCounties, fetchForecast } from './api';

const DEFAULT_COUNTY = 'Fresno';

export default function App() {
  const [county, setCounty] = useState(DEFAULT_COUNTY);
  const [theme, setTheme] = useState('good');
  const [countyList, setCountyList] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('forecast');

  useEffect(() => {
    fetchCounties()
      .then((data) => {
        setCountyList(data.counties || []);
      })
      .catch(() => {
        setCountyList([{ county: DEFAULT_COUNTY, aqi: 0, status: 'Loading...' }]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchForecast(county)
      .then((data) => {
        setForecast(data);
        setTheme(aqiTheme(data.aqi));
        setLoading(false);
      })
      .catch(() => {
        setForecast(null);
        setLoading(false);
      });
  }, [county]);

  function handleMapSelect(countyName) {
    setCounty(countyName);
    setPage('forecast');
  }

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <Background theme={theme} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav activePage={page} setPage={setPage} />

        {page === 'forecast' && (
          <>
            <Hero
              county={county}
              setCounty={setCounty}
              forecast={forecast}
              countyList={countyList}
              loading={loading}
            />
            <HourlyStrip county={county} forecast={forecast} />
            <WeeklyGrid forecast={forecast} />
            <ChatBar county={county} />
          </>
        )}

        {page === 'map' && (
          <MapView onSelectCounty={handleMapSelect} />
        )}

        {page === 'methodology' && (
          <Methodology />
        )}

        {page === 'about' && (
          <About />
        )}

        <Footer />
      </div>
    </div>
  );
}
