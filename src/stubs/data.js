export const COUNTIES = {
  'Fresno': {
    aqi: 87, pm: 23.4, tmr: 26.1,
    status: 'Moderate', theme: 'moderate',
    desc: 'Air quality is acceptable. Sensitive individuals should reduce prolonged outdoor exertion.',
    temp: '28.4°C', wind: '3.1 m/s', humidity: '42%', pressure: '1013 hPa',
    hourly: [20,18,16,15,14,13,14,17,22,26,30,33,36,38,36,32,29,26,23,21,19,18,17,16],
  },
  'Los Angeles': {
    aqi: 62, pm: 17.1, tmr: 19.4,
    status: 'Moderate', theme: 'moderate',
    desc: 'Air quality is acceptable. Some pollutants may be a concern for a small number of sensitive people.',
    temp: '24.1°C', wind: '4.2 m/s', humidity: '58%', pressure: '1015 hPa',
    hourly: [14,13,12,11,11,10,11,14,18,21,24,26,28,29,28,25,23,20,18,16,15,14,13,12],
  },
  'San Francisco': {
    aqi: 34, pm: 8.9, tmr: 7.2,
    status: 'Good', theme: 'good',
    desc: 'Air quality is satisfactory and poses little or no risk.',
    temp: '16.2°C', wind: '6.8 m/s', humidity: '72%', pressure: '1018 hPa',
    hourly: [10,9,8,8,7,7,8,10,13,15,16,17,18,18,17,16,14,12,11,11,10,10,9,9],
  },
  'Bakersfield': {
    aqi: 142, pm: 54.2, tmr: 61.8,
    status: 'Unhealthy for Sensitive Groups', theme: 'sensitive',
    desc: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    temp: '33.7°C', wind: '1.8 m/s', humidity: '28%', pressure: '1010 hPa',
    hourly: [55,52,48,45,43,42,44,50,62,74,86,94,100,104,100,92,82,72,65,60,57,55,53,52],
  },
  'Sacramento': {
    aqi: 55, pm: 14.3, tmr: 13.1,
    status: 'Moderate', theme: 'moderate',
    desc: 'Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.',
    temp: '26.8°C', wind: '2.9 m/s', humidity: '45%', pressure: '1014 hPa',
    hourly: [16,15,14,13,12,12,13,16,20,24,28,31,33,34,33,30,27,24,21,19,18,17,16,15],
  },
  'San Diego': {
    aqi: 38, pm: 9.8, tmr: 10.2,
    status: 'Good', theme: 'good',
    desc: 'Air quality is satisfactory and air pollution poses little or no risk.',
    temp: '21.3°C', wind: '5.1 m/s', humidity: '65%', pressure: '1017 hPa',
    hourly: [11,10,9,9,8,8,9,11,14,16,18,19,20,21,20,19,17,15,13,12,12,11,11,10],
  },
  'Riverside': {
    aqi: 98, pm: 31.4, tmr: 35.7,
    status: 'Moderate', theme: 'moderate',
    desc: 'Air quality is acceptable. Unusually sensitive individuals should consider reducing prolonged outdoor exertion.',
    temp: '31.2°C', wind: '2.3 m/s', humidity: '33%', pressure: '1011 hPa',
    hourly: [28,26,24,22,21,20,22,27,35,42,50,56,60,62,60,54,47,40,35,32,30,29,28,27],
  },
};

export const WEEKLY = {
  'Fresno': [
    { day: 'Today', aqi: 87,  lo: 14, hi: 38 },
    { day: 'Tue',   aqi: 72,  lo: 12, hi: 30 },
    { day: 'Wed',   aqi: 45,  lo: 9,  hi: 22 },
    { day: 'Thu',   aqi: 38,  lo: 8,  hi: 18 },
    { day: 'Fri',   aqi: 95,  lo: 18, hi: 42 },
    { day: 'Sat',   aqi: 110, lo: 22, hi: 52 },
    { day: 'Sun',   aqi: 68,  lo: 11, hi: 28 },
  ],
  'Los Angeles': [
    { day: 'Today', aqi: 62,  lo: 11, hi: 29 },
    { day: 'Tue',   aqi: 58,  lo: 10, hi: 26 },
    { day: 'Wed',   aqi: 44,  lo: 8,  hi: 20 },
    { day: 'Thu',   aqi: 51,  lo: 9,  hi: 23 },
    { day: 'Fri',   aqi: 78,  lo: 14, hi: 35 },
    { day: 'Sat',   aqi: 85,  lo: 16, hi: 38 },
    { day: 'Sun',   aqi: 60,  lo: 10, hi: 27 },
  ],
  'San Francisco': [
    { day: 'Today', aqi: 34,  lo: 7,  hi: 18 },
    { day: 'Tue',   aqi: 28,  lo: 6,  hi: 15 },
    { day: 'Wed',   aqi: 22,  lo: 5,  hi: 12 },
    { day: 'Thu',   aqi: 31,  lo: 6,  hi: 16 },
    { day: 'Fri',   aqi: 40,  lo: 8,  hi: 21 },
    { day: 'Sat',   aqi: 35,  lo: 7,  hi: 18 },
    { day: 'Sun',   aqi: 29,  lo: 6,  hi: 15 },
  ],
  'Bakersfield': [
    { day: 'Today', aqi: 142, lo: 42, hi: 104 },
    { day: 'Tue',   aqi: 155, lo: 46, hi: 112 },
    { day: 'Wed',   aqi: 138, lo: 40, hi: 98  },
    { day: 'Thu',   aqi: 120, lo: 34, hi: 86  },
    { day: 'Fri',   aqi: 148, lo: 44, hi: 108 },
    { day: 'Sat',   aqi: 162, lo: 50, hi: 120 },
    { day: 'Sun',   aqi: 130, lo: 38, hi: 92  },
  ],
  'Sacramento': [
    { day: 'Today', aqi: 55,  lo: 12, hi: 34 },
    { day: 'Tue',   aqi: 48,  lo: 10, hi: 28 },
    { day: 'Wed',   aqi: 36,  lo: 8,  hi: 20 },
    { day: 'Thu',   aqi: 42,  lo: 9,  hi: 24 },
    { day: 'Fri',   aqi: 68,  lo: 15, hi: 38 },
    { day: 'Sat',   aqi: 75,  lo: 17, hi: 42 },
    { day: 'Sun',   aqi: 52,  lo: 11, hi: 30 },
  ],
  'San Diego': [
    { day: 'Today', aqi: 38,  lo: 8,  hi: 21 },
    { day: 'Tue',   aqi: 32,  lo: 7,  hi: 18 },
    { day: 'Wed',   aqi: 28,  lo: 6,  hi: 15 },
    { day: 'Thu',   aqi: 35,  lo: 7,  hi: 19 },
    { day: 'Fri',   aqi: 45,  lo: 9,  hi: 24 },
    { day: 'Sat',   aqi: 42,  lo: 9,  hi: 22 },
    { day: 'Sun',   aqi: 36,  lo: 8,  hi: 20 },
  ],
  'Riverside': [
    { day: 'Today', aqi: 98,  lo: 20, hi: 62 },
    { day: 'Tue',   aqi: 88,  lo: 18, hi: 55 },
    { day: 'Wed',   aqi: 72,  lo: 14, hi: 44 },
    { day: 'Thu',   aqi: 80,  lo: 16, hi: 50 },
    { day: 'Fri',   aqi: 105, lo: 24, hi: 68 },
    { day: 'Sat',   aqi: 118, lo: 28, hi: 78 },
    { day: 'Sun',   aqi: 90,  lo: 18, hi: 58 },
  ],
};

export const CHAT_RESPONSES = [
  {
    keywords: ['jog', 'run', 'exercise', 'walk', 'bike'],
    handler: (county) => {
      const c = COUNTIES[county];
      if (!c) return `I don't have data for that county right now.`;
      if (c.aqi <= 50)  return `Great day for a run in ${county}! AQI is ${c.aqi} — air is clean and fresh. Go enjoy it.`;
      if (c.aqi <= 100) return `Exercise is fine in ${county} today (AQI ${c.aqi}). Sensitive individuals should keep it moderate and avoid peak afternoon hours.`;
      if (c.aqi <= 150) return `Caution for outdoor exercise in ${county} — AQI is ${c.aqi}. Sensitive groups should move workouts indoors or reschedule.`;
      return `Avoid strenuous outdoor exercise in ${county} today. AQI is ${c.aqi} — ${c.status}. Stay indoors if possible.`;
    },
  },
  {
    keywords: ['park', 'kids', 'children', 'family', 'playground'],
    handler: (county) => {
      const c = COUNTIES[county];
      if (!c) return `I don't have data for that county right now.`;
      if (c.aqi <= 50)  return `Perfect conditions for kids at the park in ${county}! AQI ${c.aqi} — no restrictions needed.`;
      if (c.aqi <= 100) return `Parks are fine for most families in ${county} today (AQI ${c.aqi}). Kids with asthma should limit time outside.`;
      return `Consider keeping children indoors in ${county} — AQI is ${c.aqi} (${c.status}). Prolonged outdoor play is not recommended.`;
    },
  },
  {
    keywords: ['tomorrow'],
    handler: (county) => {
      const c = COUNTIES[county];
      if (!c) return `I don't have data for that county right now.`;
      const tmrAqi = Math.round(c.tmr);
      const tmrLabel = tmrAqi <= 50 ? 'Good' : tmrAqi <= 100 ? 'Moderate' : tmrAqi <= 150 ? 'Unhealthy for Sensitive Groups' : 'Unhealthy';
      return `Tomorrow in ${county}: forecast AQI around ${tmrAqi} (${tmrLabel}). ${tmrAqi > c.aqi ? 'Conditions are expected to worsen slightly.' : 'A mild improvement from today.'}`;
    },
  },
  {
    keywords: ['weekend', 'saturday', 'sunday'],
    handler: (county) => {
      const w = WEEKLY[county];
      if (!w) return `I don't have weekly data for that county right now.`;
      const sat = w.find(d => d.day === 'Sat');
      const sun = w.find(d => d.day === 'Sun');
      if (!sat || !sun) return `Weekend forecast unavailable.`;
      return `Weekend outlook for ${county}: Saturday AQI ${sat.aqi}, Sunday AQI ${sun.aqi}. ${Math.max(sat.aqi, sun.aqi) > 100 ? 'Plan outdoor activities for early morning.' : 'Should be manageable for most activities.'}`;
    },
  },
  {
    keywords: ['compare', 'vs', 'versus', 'better', 'worse'],
    handler: () => {
      const counties = Object.entries(COUNTIES).sort((a, b) => a[1].aqi - b[1].aqi);
      const best  = counties[0];
      const worst = counties[counties.length - 1];
      return `Today's best air quality: ${best[0]} (AQI ${best[1].aqi}). Worst: ${worst[0]} (AQI ${worst[1].aqi}). ${best[0]} air is ${Math.round(worst[1].aqi / best[1].aqi)}× cleaner than ${worst[0]}.`;
    },
  },
  {
    keywords: ['los angeles', 'la'],
    handler: () => {
      const c = COUNTIES['Los Angeles'];
      return `Los Angeles today: AQI ${c.aqi} (${c.status}). PM2.5 at ${c.pm} µg/m³. ${c.desc}`;
    },
  },
  {
    keywords: ['san francisco', 'sf', 'bay area'],
    handler: () => {
      const c = COUNTIES['San Francisco'];
      return `San Francisco today: AQI ${c.aqi} (${c.status}). One of the cleanest readings in the state today. PM2.5 at ${c.pm} µg/m³.`;
    },
  },
  {
    keywords: ['sacramento'],
    handler: () => {
      const c = COUNTIES['Sacramento'];
      return `Sacramento today: AQI ${c.aqi} (${c.status}). PM2.5 at ${c.pm} µg/m³. ${c.desc}`;
    },
  },
  {
    keywords: ['bakersfield'],
    handler: () => {
      const c = COUNTIES['Bakersfield'];
      return `Bakersfield today: AQI ${c.aqi} (${c.status}) — one of the highest readings today. PM2.5 at ${c.pm} µg/m³. Sensitive groups should stay indoors.`;
    },
  },
];
