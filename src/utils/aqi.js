export const aqiColor = (aqi) => {
  if (aqi <= 50)  return 'rgba(58,125,68,0.9)';
  if (aqi <= 100) return 'rgba(253,181,21,0.9)';
  if (aqi <= 150) return 'rgba(232,88,26,0.9)';
  if (aqi <= 200) return 'rgba(192,57,43,0.9)';
  return 'rgba(126,0,35,0.9)';
};

export const aqiTheme = (aqi) => {
  if (aqi <= 50)  return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'sensitive';
  if (aqi <= 200) return 'unhealthy';
  return 'hazardous';
};

export const aqiLabel = (aqi) => {
  if (aqi <= 50)  return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  return 'Hazardous';
};
