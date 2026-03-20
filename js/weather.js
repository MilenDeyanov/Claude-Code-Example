/* ============================================================
   WEATHER.JS — Open-Meteo + BigDataCloud reverse geocoding
   ============================================================ */

const TEMP_KEY = 'pulse_temp_unit';

// WMO weather code → emoji + label
const WMO_MAP = {
  0:  { emoji: '☀️',  label: 'Clear sky' },
  1:  { emoji: '⛅',  label: 'Mostly clear' },
  2:  { emoji: '⛅',  label: 'Partly cloudy' },
  3:  { emoji: '⛅',  label: 'Overcast' },
  45: { emoji: '🌫️', label: 'Fog' },
  48: { emoji: '🌫️', label: 'Icy fog' },
  51: { emoji: '🌦️', label: 'Light drizzle' },
  53: { emoji: '🌦️', label: 'Drizzle' },
  55: { emoji: '🌦️', label: 'Heavy drizzle' },
  61: { emoji: '🌧️', label: 'Light rain' },
  63: { emoji: '🌧️', label: 'Rain' },
  65: { emoji: '🌧️', label: 'Heavy rain' },
  71: { emoji: '❄️',  label: 'Light snow' },
  73: { emoji: '❄️',  label: 'Snow' },
  75: { emoji: '❄️',  label: 'Heavy snow' },
  80: { emoji: '🌧️', label: 'Showers' },
  81: { emoji: '🌧️', label: 'Showers' },
  82: { emoji: '🌧️', label: 'Violent showers' },
  95: { emoji: '⛈️',  label: 'Thunderstorm' },
  96: { emoji: '⛈️',  label: 'Thunderstorm with hail' },
  99: { emoji: '⛈️',  label: 'Thunderstorm with hail' },
};

function getCondition(code) {
  return WMO_MAP[code] ?? { emoji: '🌡️', label: 'Unknown' };
}

// Temperature conversion helpers
function toF(c) { return (c * 9 / 5) + 32; }

function formatTemp(c, unit) {
  return unit === 'f'
    ? `${Math.round(toF(c))}°F`
    : `${Math.round(c)}°C`;
}

// Day abbreviation from ISO date string
function dayName(dateStr) {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short' });
}

// Module-level state so the toggle can re-render without re-fetching
let _weatherData = null;
let _unit = localStorage.getItem(TEMP_KEY) || 'c';

function showToast(msg) {
  if (typeof Toastify === 'undefined') return;
  Toastify({
    text: msg,
    duration: 3000,
    gravity: 'bottom',
    position: 'right',
    style: {
      background: 'var(--color-primary)',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-body)',
      fontSize: '0.875rem',
    },
  }).showToast();
}

function renderWeather(data, cityName, unit) {
  const el = document.getElementById('weather-content');
  if (!el) return;

  const cur = data.current;
  const daily = data.daily;
  const condition = getCondition(cur.weather_code);

  // Build 5-day forecast rows
  const forecastHTML = daily.time.slice(0, 5).map((date, i) => {
    const cond = getCondition(daily.weather_code[i]);
    return `
      <div class="forecast-day">
        <span class="day-name">${dayName(date)}</span>
        <span class="day-emoji">${cond.emoji}</span>
        <div class="day-temps">
          <div>${formatTemp(daily.temperature_2m_max[i], unit)}</div>
          <div class="temp-low">${formatTemp(daily.temperature_2m_min[i], unit)}</div>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="weather-location font-display">${cityName}</div>
    <div class="weather-temp font-mono" id="weather-temp">${formatTemp(cur.temperature_2m, unit)}</div>
    <div class="weather-condition">
      <span class="emoji">${condition.emoji}</span>
      <span>${condition.label}</span>
    </div>
    <div class="pill-row">
      <span class="pill">💧 ${cur.relative_humidity_2m}%</span>
      <span class="pill">💨 ${Math.round(cur.wind_speed_10m)} km/h</span>
      <span class="pill" id="weather-feels">Feels ${formatTemp(cur.apparent_temperature, unit)}</span>
    </div>
    <div class="forecast-strip" id="weather-forecast">${forecastHTML}</div>
    <button class="unit-toggle" id="unit-toggle">Switch to ${unit === 'c' ? '°F' : '°C'}</button>
  `;

  el.classList.remove('is-loading');

  // Wire up the unit toggle button
  document.getElementById('unit-toggle').addEventListener('click', () => {
    _unit = _unit === 'c' ? 'f' : 'c';
    localStorage.setItem(TEMP_KEY, _unit);
    showToast(_unit === 'f' ? 'Switched to Fahrenheit' : 'Switched to Celsius');
    renderWeather(_weatherData, cityName, _unit);
  });
}

async function fetchWeather(lat, lon, cityName) {
  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m`
    + `&daily=temperature_2m_max,temperature_2m_min,weather_code`
    + `&timezone=auto`
    + `&forecast_days=5`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  return res.json();
}

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client`
      + `?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) return 'Your location';
    const data = await res.json();
    return [data.city || data.locality, data.countryName]
      .filter(Boolean).join(', ') || 'Your location';
  } catch {
    return 'Your location';
  }
}

async function loadWeather(lat, lon) {
  try {
    const [data, cityName] = await Promise.all([
      fetchWeather(lat, lon),
      reverseGeocode(lat, lon),
    ]);
    _weatherData = data;
    renderWeather(data, cityName, _unit);
  } catch (err) {
    const el = document.getElementById('weather-content');
    if (el) {
      el.innerHTML = '<p class="widget-error">Could not load weather data.</p>';
      el.classList.remove('is-loading');
    }
    console.error('[weather]', err);
  }
}

export function initWeather() {
  if (!navigator.geolocation) {
    loadWeather(51.5074, -0.1278); // London fallback
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
    ()    => loadWeather(51.5074, -0.1278), // denied → London
    { timeout: 8000 }
  );
}
