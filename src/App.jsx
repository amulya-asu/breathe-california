import { useState } from 'react';
import Background from './components/Background';
import Nav from './components/Nav';
import Hero from './components/Hero';
import HourlyStrip from './components/HourlyStrip';
import WeeklyGrid from './components/WeeklyGrid';
import ChatBar from './components/ChatBar';
import Footer from './components/Footer';
import { COUNTIES } from './stubs/data';
import { aqiTheme } from './utils/aqi';

const DEFAULT_COUNTY = 'Fresno';

export default function App() {
  const [county, setCounty] = useState(DEFAULT_COUNTY);
  const [theme, setTheme] = useState(() => aqiTheme(COUNTIES[DEFAULT_COUNTY].aqi));

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <Background theme={theme} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav />
        <Hero county={county} setCounty={setCounty} setTheme={setTheme} />
        <HourlyStrip county={county} />
        <WeeklyGrid county={county} />
        <ChatBar county={county} />
        <Footer />
      </div>
    </div>
  );
}
