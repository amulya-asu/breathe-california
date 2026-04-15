import { useState, useEffect, useRef } from 'react';
import Background from './components/Background';
import Nav from './components/Nav';
import Hero from './components/Hero';
import HourlyStrip from './components/HourlyStrip';
import WeeklyGrid from './components/WeeklyGrid';
import ChatPage from './components/ChatPage';
import MapView from './components/MapView';
import Methodology from './components/Methodology';
import About from './components/About';
import Footer from './components/Footer';
import { aqiTheme } from './utils/aqi';
import { fetchStations, fetchStationForecast, fetchForecast } from './api';

const DEFAULT_COUNTY = 'Fresno';

export default function App() {
  const [county, setCounty] = useState(DEFAULT_COUNTY);
  const [stationId, setStationId] = useState(null);
  const [theme, setTheme] = useState('good');
  const [stationList, setStationList] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('forecast');
  const topRef = useRef(null);

  // Load all stations on mount
  useEffect(() => {
    fetchStations()
      .then((data) => {
        setStationList(data.stations || []);
        // Auto-select first Fresno station
        const defaultStation = (data.stations || []).find(s => s.county === DEFAULT_COUNTY);
        if (defaultStation) {
          setStationId(defaultStation.station_id);
        }
      })
      .catch(() => {
        setStationList([]);
      });
  }, []);

  // Load forecast when station or county changes
  useEffect(() => {
    setLoading(true);
    if (stationId) {
      fetchStationForecast(stationId)
        .then((data) => {
          setForecast(data);
          setCounty(data.county);
          setTheme(aqiTheme(data.aqi));
          setLoading(false);
        })
        .catch(() => {
          setForecast(null);
          setLoading(false);
        });
    } else if (county) {
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
    }
  }, [stationId, county]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  function handleMapSelect(selectedStationId, selectedCounty) {
    setStationId(selectedStationId);
    setCounty(selectedCounty);
    setPage('forecast');
  }

  function handleSearchSelect(item) {
    if (item.station_id) {
      setStationId(item.station_id);
      setCounty(item.county);
    } else {
      setStationId(null);
      setCounty(item.county);
    }
  }

  return (
    <div ref={topRef} style={{ position: 'relative', minHeight: '100%' }}>
      <Background theme={theme} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav activePage={page} setPage={setPage} />

        {page === 'forecast' && (
          <>
            <Hero
              county={county}
              stationId={stationId}
              forecast={forecast}
              stationList={stationList}
              onSelect={handleSearchSelect}
              loading={loading}
            />
            <HourlyStrip forecast={forecast} />
            <WeeklyGrid forecast={forecast} />
          </>
        )}

        {page === 'map' && (
          <MapView stationList={stationList} onSelectStation={handleMapSelect} />
        )}

        {page === 'assistant' && (
          <ChatPage stationList={stationList} county={county} stationId={stationId} />
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
