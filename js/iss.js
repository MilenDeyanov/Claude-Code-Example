/* ============================================================
   ISS.JS — Leaflet map + live ISS position polling
   ============================================================ */

const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';
const POLL_INTERVAL = 5000; // ms
const MAX_FAILURES = 3;

let _map = null;
let _marker = null;
let _lastLat = null;
let _lastLon = null;
let _failures = 0;
let _intervalId = null;

function formatNum(n, decimals = 4) {
  return Number(n).toFixed(decimals);
}

function formatVelocity(v) {
  return Math.round(v).toLocaleString();
}

function updateCoords(lat, lon, alt, vel) {
  const el = document.getElementById('iss-coords');
  if (!el) return;
  el.innerHTML = `
    <span>Lat: ${formatNum(lat)}°</span>
    <span>Lon: ${formatNum(lon)}°</span>
    <span>Alt: ${formatNum(alt, 1)} km</span>
    <span>Vel: ${formatVelocity(vel)} km/h</span>
  `;
}

function initMap() {
  // Leaflet requires the container to have an explicit height before init
  const mapEl = document.getElementById('iss-map');
  if (!mapEl) return;

  _map = L.map('iss-map', {
    zoomControl: false,
    attributionControl: true,
  });

  _map.setView([0, 0], 2);

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }
  ).addTo(_map);

  // Custom ISS marker using divIcon
  const issIcon = L.divIcon({
    className: '',
    html: '<div class="iss-marker">🛸</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  _marker = L.marker([0, 0], { icon: issIcon }).addTo(_map);
}

function initCoordsDisplay() {
  const body = document.getElementById('iss-content');
  if (!body) return;

  // Remove skeleton lines, add coords div
  body.classList.remove('is-loading');
  body.innerHTML = `
    <div id="iss-map"></div>
    <div class="iss-coords font-mono" id="iss-coords">
      <span>Fetching position…</span>
    </div>
  `;
}

async function pollISS() {
  try {
    const res = await fetch(ISS_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const { latitude: lat, longitude: lon, altitude: alt, velocity: vel } = data;

    // Move marker
    if (_marker) _marker.setLatLng([lat, lon]);

    // Pan map only if ISS moved more than 0.5°
    if (_map) {
      const moved = _lastLat === null
        || Math.abs(lat - _lastLat) > 0.5
        || Math.abs(lon - _lastLon) > 0.5;

      if (moved) {
        _map.panTo([lat, lon], { animate: true, duration: 2 });
      }
    }

    _lastLat = lat;
    _lastLon = lon;
    _failures = 0;

    updateCoords(lat, lon, alt, vel);
  } catch (err) {
    _failures++;
    console.warn(`[iss] fetch failed (${_failures}/${MAX_FAILURES}):`, err.message);

    if (_failures >= MAX_FAILURES) {
      clearInterval(_intervalId);
      const coordsEl = document.getElementById('iss-coords');
      if (coordsEl) {
        coordsEl.innerHTML = '<span class="widget-error">Could not load ISS data.</span>';
      }
    }
  }
}

export function initISS() {
  if (typeof L === 'undefined') {
    const el = document.getElementById('iss-content');
    if (el) {
      el.innerHTML = '<p class="widget-error">Could not load map.</p>';
      el.classList.remove('is-loading');
    }
    return;
  }

  initCoordsDisplay();
  initMap();

  // First poll immediately, then on interval
  pollISS();
  _intervalId = setInterval(pollISS, POLL_INTERVAL);
}
