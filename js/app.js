/* ============================================================
   APP.JS — Bootstrap: clock, theme toggle, AOS, Typed.js,
            import and init all widget modules
   ============================================================ */

// ── Live clock ────────────────────────────────────────────
function updateClock() {
  const now = new Date();

  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString([], {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}

updateClock();
setInterval(updateClock, 1000);

// ── Theme toggle ──────────────────────────────────────────
const THEME_KEY = 'pulse_theme';

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function showToast(message) {
  if (typeof Toastify === 'undefined') return;
  Toastify({
    text: message,
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

// Apply saved theme on load
const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
applyTheme(savedTheme);

// Wire up toggle button
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
    showToast(next === 'dark' ? 'Dark mode on' : 'Light mode on');
  });
}

// ── AOS init ──────────────────────────────────────────────
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 600, once: true, offset: 40 });
}

// ── Typed.js init ─────────────────────────────────────────
if (typeof Typed !== 'undefined') {
  new Typed('#typewriter', {
    strings: [
      'Live data. Real time.',
      'Weather. Markets. Space.',
      'Open APIs. No keys needed.',
    ],
    typeSpeed: 45,
    backSpeed: 25,
    backDelay: 2200,
    loop: true,
    showCursor: true,
    cursorChar: '|',
  });
}

// ── Widget initialisers ───────────────────────────────────
// Each import is wrapped in try/catch so missing files never
// crash the page — they will be added in subsequent steps.

try {
  const { initWeather } = await import('./weather.js');
  initWeather();
} catch (e) {
  console.info('[app] weather.js not ready:', e.message);
}

try {
  const { initISS } = await import('./iss.js');
  initISS();
} catch (e) {
  console.info('[app] iss.js not ready:', e.message);
}

try {
  const { initCrypto } = await import('./crypto.js');
  initCrypto();
} catch (e) {
  console.info('[app] crypto.js not ready:', e.message);
}

try {
  const { initCountries } = await import('./countries.js');
  initCountries();
} catch (e) {
  console.info('[app] countries.js not ready:', e.message);
}

try {
  const { initQuote } = await import('./quote.js');
  initQuote();
} catch (e) {
  console.info('[app] quote.js not ready:', e.message);
}
