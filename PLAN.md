# Project Plan: Pulse Dashboard

A proof-of-concept single-page dashboard showcasing integrations with 3rd party libraries
and keyless APIs, styled with a Natural Modern Flow aesthetic.

---

## Concept

A calm, organic-feeling live dashboard that pulls real data from 5 different sources,
presents it through beautiful visualisations, and includes 3 custom JavaScript features.
No build tools, no API keys, no package manager — just HTML, CSS, and JavaScript served
from a static file or local dev server.

---

## File Structure

```
/
├── index.html
├── styles/
│   ├── base.css          # CSS variables, reset, typography, global elements
│   ├── layout.css        # Grid system, header, responsive breakpoints
│   ├── widgets.css       # Individual widget card styles
│   └── animations.css    # Skeleton loaders, transitions, AOS overrides
└── js/
    ├── app.js            # Bootstrap: clock, theme toggle, init all modules
    ├── weather.js        # Open-Meteo + BigDataCloud reverse geocoding
    ├── crypto.js         # CoinGecko + Chart.js bar chart
    ├── countries.js      # REST Countries random country card
    ├── iss.js            # Where The ISS At + Leaflet.js map
    └── quote.js          # DummyJSON random quote
```

---

## Design System

### Philosophy — Natural Modern Flow

Warm, organic, and grounded. The UI should feel like a well-designed print magazine
that happens to be alive. No harsh neon, no dark cyberpunk. Think natural materials:
linen, clay, sage, deep water.

### Color Palette

```
--color-bg:           #FEFDFB   /* Warm near-white — main page background */
--color-surface:      #F5F0EB   /* Warm off-white — card backgrounds */
--color-surface-alt:  #EDE8E0   /* Slightly deeper — borders, inputs */
--color-primary:      #2C5E6E   /* Deep teal — primary accent, headings */
--color-accent:       #D9743F   /* Warm terracotta — highlights, live badges */
--color-positive:     #5C8D6E   /* Sage green — price up, good states */
--color-negative:     #C1440E   /* Earthy red-orange — price down, errors */
--color-text:         #2C2C2C   /* Dark warm grey — body text */
--color-text-muted:   #7A7065   /* Medium warm grey — labels, subtitles */
--color-border:       rgba(44, 94, 110, 0.12)
--color-shadow:       rgba(44, 45, 44, 0.08)
```

Dark mode (toggled via JS, class `dark` on `<html>`):

```
--color-bg:           #141210
--color-surface:      #1E1B18
--color-surface-alt:  #2A2520
--color-primary:      #6AACBF
--color-accent:       #E8885A
--color-text:         #EDE8E0
--color-text-muted:   #9A8F85
--color-border:       rgba(110, 172, 191, 0.15)
--color-shadow:       rgba(0, 0, 0, 0.25)
```

### Typography

Load all three from Google Fonts in a single `<link>` call:

```
https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap
```

```
--font-display: 'Playfair Display', Georgia, serif       /* Widget titles, hero text */
--font-body:    'DM Sans', system-ui, sans-serif         /* All UI text */
--font-mono:    'DM Mono', 'Courier New', monospace      /* Numbers, coordinates, live data */
```

### Spacing & Shape

```
--radius-sm:   8px
--radius-md:   16px
--radius-lg:   24px
--gap:         16px
--card-shadow: 0 2px 12px var(--color-shadow), 0 0 0 1px var(--color-border)
```

Transitions: `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

---

## CDN Dependencies

Add these in `<head>` of `index.html`, in this order:

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

<!-- Leaflet CSS (must come before Leaflet JS) -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<!-- AOS CSS -->
<link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css" />

<!-- Toastify CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css" />

<!-- Project styles -->
<link rel="stylesheet" href="styles/base.css" />
<link rel="stylesheet" href="styles/layout.css" />
<link rel="stylesheet" href="styles/widgets.css" />
<link rel="stylesheet" href="styles/animations.css" />
```

Add these before `</body>`:

```html
<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

<!-- Typed.js -->
<script src="https://unpkg.com/typed.js@2.1.0/dist/typed.umd.js"></script>

<!-- AOS JS -->
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

<!-- Toastify JS -->
<script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>

<!-- App entry point (ES module) -->
<script type="module" src="js/app.js"></script>
```

---

## Layout — Grid System

The page is a single vertical scroll. The hero sits at the top, then the widget grid below.

### Desktop (>= 1024px) — 3 column bento grid

```
+------------------+--------------------------------+------------------+
|    WEATHER       |                                |   CRYPTO         |
|    (col 1)       |       ISS TRACKER              |   (col 3)        |
+------------------+   (col 2, spans 2 rows)        |   (spans 2 rows) |
|    COUNTRY       |                                |                  |
|    (col 1)       |                                |                  |
+------------------+--------------------------------+------------------+
|                        QUOTE (full width)                           |
+---------------------------------------------------------------------+
```

CSS Grid template areas:

```css
.widget-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "weather iss crypto"
    "country iss crypto"
    "quote   quote quote";
  gap: var(--gap);
}
```

Widget area assignments:
- `.widget--weather`  → `grid-area: weather`
- `.widget--iss`      → `grid-area: iss`
- `.widget--crypto`   → `grid-area: crypto`
- `.widget--country`  → `grid-area: country`
- `.widget--quote`    → `grid-area: quote`

### Tablet (640px – 1023px) — 2 column grid

```
weather  |  crypto
country  |  crypto
iss (full width)
quote (full width)
```

### Mobile (< 640px) — Single column, stacked

All widgets stack vertically in source order: weather, crypto, iss, country, quote.

---

## Header

A simple fixed-height page header (not sticky) with:

- Left: Project name `"Pulse"` in `--font-display`, size `1.75rem`, color `--color-primary`
- Centre: Typed.js typewriter cycling through phrases:
  `"Live data. Real time.", "Weather. Markets. Space.", "Open APIs. No keys needed."`
  — font `--font-body`, size `0.875rem`, muted colour
- Right: Live clock (time + date) in `--font-mono`, and a theme toggle button (sun/moon icon)

Header height: `72px`. Subtle bottom border using `--color-border`.

---

## Widget Specs

Each widget is a `<section>` element with class `widget` plus a modifier class.
Every widget follows this internal HTML structure:

```html
<section class="widget widget--[name]" data-aos="fade-up">
  <header class="widget-header">
    <h2 class="widget-title">[Title in Playfair Display]</h2>
    <span class="widget-badge">[optional live/refresh badge]</span>
  </header>
  <div class="widget-body" id="[name]-content">
    <!-- skeleton or real content rendered by JS -->
  </div>
</section>
```

---

### Widget 1 — Weather

**Purpose**: Show current conditions at the user's location.
**3rd party**: Open-Meteo API (weather data) + BigDataCloud (reverse geocoding)
**Keyless**: Yes, both are completely free with no authentication.

**Flow**:
1. Request browser geolocation (`navigator.geolocation.getCurrentPosition`).
2. On success: call BigDataCloud reverse geocoding to get city name.
3. Call Open-Meteo with the coordinates.
4. On geolocation denied: default to London (lat: 51.5074, lon: -0.1278).

**Open-Meteo endpoint**:
```
https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m
  &daily=temperature_2m_max,temperature_2m_min,weather_code
  &timezone=auto
  &forecast_days=5
```

**BigDataCloud endpoint**:
```
https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=en
```
Returns: `city`, `countryName`, `principalSubdivision`.

**WMO weather code → emoji mapping** (use this exact mapping):
```
0       → "☀️"  Clear sky
1,2,3   → "⛅"  Partly cloudy
45,48   → "🌫️"  Fog
51,53,55 → "🌦️" Drizzle
61,63,65 → "🌧️" Rain
71,73,75 → "❄️"  Snow
80,81,82 → "🌧️" Showers
95      → "⛈️"  Thunderstorm
96,99   → "⛈️"  Thunderstorm with hail
```

**Content to render**:
- City name and country (large, `--font-display`)
- Current temperature in large `--font-mono` type (e.g. `18°C`)
- Weather emoji + condition label
- Row of pills: Humidity `XX%` · Wind `XX km/h` · Feels like `XX°C`
- 5-day forecast strip: 5 mini columns each showing day name (Mon), emoji, high/low temps
- Temperature unit toggle button (°C / °F) — this is the custom JS feature, toggles display only, no re-fetch

**Custom JS feature — Temperature toggle**:
- Store unit preference in `localStorage` (key: `pulse_temp_unit`, values: `"c"` or `"f"`)
- When toggled, convert all displayed temperature values: `F = (C × 9/5) + 32`
- Button label switches between `°C` and `°F`
- Show a Toastify toast: `"Switched to Fahrenheit"` / `"Switched to Celsius"`

---

### Widget 2 — ISS Tracker

**Purpose**: Show the International Space Station's live position on an interactive map.
**3rd party**: Where The ISS At API (position data) + Leaflet.js (map rendering)
**Keyless**: Yes, fully public API.

**API endpoint** (poll every 5 seconds):
```
https://api.wheretheiss.at/v1/satellites/25544
```
Response fields to use: `latitude`, `longitude`, `altitude` (km), `velocity` (km/h), `visibility`

**Leaflet setup**:
- Init map with `L.map('iss-map', { zoomControl: false, attributionControl: true })`
- Set initial view: `[0, 0]`, zoom `2`
- Tile layer: CartoDB Dark Matter (matches both light and dark themes better than standard OSM):
  ```
  https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
  ```
  Attribution: `&copy; OpenStreetMap contributors &copy; CARTO`
- Custom ISS marker: use `L.divIcon` with a styled `<div>` containing the 🛸 emoji,
  pulsing CSS animation ring around it (CSS keyframe `pulse-ring`)
- On each poll: update marker position with `marker.setLatLng([lat, lon])`
- Smooth pan: `map.panTo([lat, lon], { animate: true, duration: 2 })` — only pan if ISS has moved more than 0.5°

**Map container**: Give `#iss-map` a fixed height of `320px` within the widget body.
The ISS widget spans 2 grid rows, so total height will be generous.

**Content below the map**:
- `Lat: XX.XXXX° · Lon: XX.XXXX°` in `--font-mono`, small
- `Alt: XXX km · Vel: X,XXX km/h` in `--font-mono`, small
- A green "LIVE" badge in the widget header that pulses

---

### Widget 3 — Crypto Markets

**Purpose**: Show live prices for 5 cryptocurrencies with a Chart.js bar chart.
**3rd party**: CoinGecko public API (prices) + Chart.js (visualisation)
**Keyless**: Yes, CoinGecko's v3 public API requires no key for basic market data.

**API endpoint** (fetch on load, then every 60 seconds):
```
https://api.coingecko.com/api/v3/coins/markets
  ?vs_currency=usd
  &ids=bitcoin,ethereum,solana,ripple,cardano
  &order=market_cap_desc
  &per_page=5
  &page=1
  &sparkline=false
  &price_change_percentage=24h
```

**Content to render**:
1. A horizontal bar chart (Chart.js) showing the 24h price change % for each coin.
   - Bars coloured green (`--color-positive`) for positive, red (`--color-negative`) for negative.
   - Chart type: `'bar'`, orientation: horizontal (use `indexAxis: 'y'`).
   - Background: transparent. Text colour: `--color-text`.
   - No legend, no title. Minimal grid lines (only vertical, faint colour).
   - Chart height: `160px`.

2. A list below the chart with one row per coin:
   - Coin logo (`image_thumb` from API or the `image` field)
   - Coin name + symbol
   - Current price formatted as USD (e.g. `$43,210.55`)
   - 24h change badge: `+2.34%` green or `-1.12%` red
   - All values in `--font-mono`

3. A countdown timer label: `"Refreshing in Xs"` — counts down from 60 to 0 then re-fetches.
   This is updated every second with `setInterval`.

**Custom JS feature — refresh countdown**:
- Pure JS interval, no library
- Display as `"Refreshing in 45s"` in muted text under the list
- When countdown hits 0: re-fetch, reset counter to 60, show Toastify toast `"Markets updated"`

---

### Widget 4 — Country of the Day

**Purpose**: Discover a random country with key facts.
**3rd party**: REST Countries API
**Keyless**: Yes, fully public.

**API endpoint**:
```
https://restcountries.com/v3.1/all?fields=name,capital,population,region,subregion,flags,languages,currencies,area
```
Fetch the full list once on load. Pick a random entry. Re-randomise on button click.

**Content to render**:
- Country flag image (`flags.svg` or `flags.png`) — display at full width, max-height `100px`, `object-fit: cover`, with `border-radius: var(--radius-sm)`
- Country name in `--font-display`, large
- Sub-line: `Region · Subregion`
- Fact pills in a flex-wrap row:
  - 🏛️ Capital: `[capital]`
  - 👥 Population: `[formatted with commas]`
  - 📐 Area: `[formatted km²]`
  - 🗣️ Languages: first 2 languages joined by comma
  - 💰 Currency: first currency name + symbol
- A `"Discover another →"` text button that picks a new random country with a fade transition
- The entire card fades out and fades in on refresh (CSS transition on opacity)

---

### Widget 5 — Quote

**Purpose**: Display an inspiring random quote with a refresh button.
**3rd party**: DummyJSON API
**Keyless**: Yes, completely public fake-data API.

**API endpoint**:
```
https://dummyjson.com/quotes/random
```
Returns: `{ id, quote, author }`

**Fallback**: If the API fails, use this embedded array of 5 quotes (in `quote.js`):
```js
const FALLBACK_QUOTES = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { quote: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
];
```

**Content to render**:
- A large decorative opening quote mark `"` in `--font-display`, size `4rem`, colour `--color-accent`, opacity 0.4
- Quote text in `--font-display`, italic, size `1.125rem`
- Author attribution: `— Author Name` in `--font-body`, muted, right-aligned
- A `"New quote ↻"` button — on click: fade out, fetch new quote, fade in
- The widget spans full width (bottom row), so the quote has generous horizontal padding

---

## Custom JavaScript Features (summary)

These are pure JS, no library dependency:

| # | Feature | Location | Description |
|---|---------|----------|-------------|
| 1 | Live Clock | `app.js` | Updates every second, shows time `HH:MM:SS` and date `Weekday, DD Month YYYY` in header. Uses `toLocaleTimeString` and `toLocaleDateString`. |
| 2 | Dark/Light Theme Toggle | `app.js` | Toggles class `dark` on `<html>`. Saves preference in `localStorage` key `pulse_theme`. Applies saved preference on page load. Button shows ☀️ in dark mode, 🌙 in light mode. Shows Toastify toast on change. |
| 3 | Temperature Unit Toggle | `weather.js` | Converts all rendered temperature values between °C and °F without re-fetching. Saves preference in `localStorage` key `pulse_temp_unit`. |

---

## Animations & Interactions

**AOS**: Initialise with `AOS.init({ duration: 600, once: true, offset: 40 })` in `app.js`.
Apply `data-aos="fade-up"` to each `.widget` element with staggered delays:
- Weather: `data-aos-delay="0"`
- ISS: `data-aos-delay="100"`
- Crypto: `data-aos-delay="200"`
- Country: `data-aos-delay="300"`
- Quote: `data-aos-delay="400"`

**Skeleton loaders**: Before data loads, each `.widget-body` should show 3 grey animated
skeleton lines using CSS `@keyframes shimmer`. This is handled purely in CSS — add class
`is-loading` to `.widget-body` by default, remove it after data renders.

```css
.skeleton-line {
  height: 1em;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-surface) 50%, var(--color-surface-alt) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Toastify configuration** (use these settings throughout):
```js
Toastify({
  text: message,
  duration: 3000,
  gravity: "bottom",
  position: "right",
  style: {
    background: "var(--color-primary)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-body)",
    fontSize: "0.875rem",
  },
}).showToast();
```

**Chart.js theming**: Register a custom defaults object after Chart.js loads so the chart
respects the CSS colour variables. Read computed styles from `:root` to get hex values.

---

## Process Rules for Claude Code

These rules govern how Claude Code must behave while executing this plan:

### Step-by-step execution

- Work through the Implementation Steps below **one step at a time**.
- After completing a step, mark its checkbox `[x]` in this file before moving to the next.
- Do not start the next step until the current one is complete and screenshotted.

### Commit messages (do NOT commit — just report)

- Claude Code must **not** run `git commit` or any git commands.
- After marking a step complete, output a clearly labelled suggested commit message in this format:

  ```
  SUGGESTED COMMIT:
  feat: add HTML skeleton and CDN dependencies

  Sets up index.html with all widget placeholders, Google Fonts,
  and CDN script/link tags for Leaflet, Chart.js, Typed.js, AOS, Toastify.
  ```

- The user will commit manually when they choose to.

### Playwright screenshots (before & after each step)

Before starting each step:
1. Ensure a local server is running on port **3000**.
   - If not already running, start it in the background: `npx serve . -p 3000`
   - If `serve` is not available try: `npx http-server . -p 3000`
2. Navigate Playwright to `http://localhost:3000`
3. Take a **before** screenshot and save it to `screenshots/step-XX-before.png`
   (where XX is the zero-padded step number, e.g. `01`, `02`).
   - For Step 01 there is nothing to show yet — take a screenshot of the blank browser
     and save as `screenshots/step-01-before.png` anyway.
4. Complete all file changes for the step.
5. Navigate Playwright to `http://localhost:3000` again (hard reload).
6. Take an **after** screenshot and save it to `screenshots/step-XX-after.png`.
7. Output both screenshot paths to the user.

Screenshots folder must exist. Create `screenshots/` directory if it does not exist.

---

## Implementation Steps

Work through these in order. Check each box when the step is fully done and screenshotted.

- [x] **Step 01 — HTML skeleton**
  Create `index.html` with full page structure: `<head>` with all CDN `<link>` and `<script>` tags,
  Google Fonts link, project stylesheet links, all five widget `<section>` elements with correct
  classes and IDs, placeholder text inside each widget body, and the app entry point
  `<script type="module" src="js/app.js">`.
  - Suggested commit: `feat: add index.html skeleton with all widget placeholders and CDN tags`

- [x] **Step 02 — Base CSS**
  Create `styles/base.css`: CSS custom properties on `:root` (light theme) and `html.dark`
  (dark theme) for all colours, fonts, spacing, radius, and shadow. CSS reset. Body background,
  font-family, colour. Typography utility classes (`.font-display`, `.font-mono`, `.text-muted`).
  - Suggested commit: `feat: add base.css with design tokens, reset, and typography`

- [x] **Step 03 — Layout CSS**
  Create `styles/layout.css`: page wrapper, header styles (height, flex, border), bento grid
  with `grid-template-areas` for desktop, tablet breakpoint (640–1023px), mobile breakpoint
  (< 640px), and page padding/max-width.
  - Suggested commit: `feat: add layout.css with bento grid and responsive breakpoints`

- [x] **Step 04 — Widget CSS**
  Create `styles/widgets.css`: `.widget` card base (surface colour, border, shadow, radius,
  padding), `.widget-header` flex row, `.widget-title` font styling, `.widget-badge` and
  `.live-badge` styles, pill/tag styles, forecast strip styles, countdown text style,
  ISS coordinate row style, quote decorative mark style, country flag image style.
  - Suggested commit: `feat: add widgets.css with card styles and all widget-specific rules`

- [x] **Step 05 — Animations CSS**
  Create `styles/animations.css`: `@keyframes shimmer` and `.skeleton-line` skeleton loader,
  `@keyframes pulse-ring` for the ISS live badge, `.fade` transition class for country/quote
  refresh, AOS override rules to respect the colour variables, `is-loading` state on
  `.widget-body` that shows 3 skeleton lines.
  - Suggested commit: `feat: add animations.css with shimmer skeleton, pulse-ring, and fade transitions`

- [x] **Step 06 — app.js (clock + theme toggle + AOS init)**
  Create `js/app.js`: live clock updating every second using `toLocaleTimeString` /
  `toLocaleDateString`, dark/light theme toggle reading/writing `localStorage` key `pulse_theme`,
  AOS initialisation, Typed.js initialisation for the header typewriter, import and call all
  widget init functions (stub them out if the widget files don't exist yet — wrap each import
  in try/catch so the page does not break).
  - Suggested commit: `feat: add app.js with clock, theme toggle, AOS and Typed.js init`

- [x] **Step 07 — weather.js**
  Create `js/weather.js`: browser geolocation → BigDataCloud reverse geocoding → Open-Meteo
  forecast fetch → render city, current temp, condition emoji, humidity/wind/feels-like pills,
  5-day forecast strip. Temperature unit toggle (°C / °F) reading/writing `localStorage` key
  `pulse_temp_unit`. Toastify toast on unit switch. Fallback to London on geolocation denial.
  - Suggested commit: `feat: add weather.js with Open-Meteo integration and °C/°F toggle`

- [x] **Step 08 — iss.js**
  Create `js/iss.js`: Leaflet map init with CartoDB Dark Matter tiles, custom ISS `L.divIcon`
  marker with pulse animation, first fetch from `https://api.wheretheiss.at/v1/satellites/25544`,
  polling loop every 5 seconds with `setInterval`, smooth `map.panTo` (only if ISS moved > 0.5°),
  altitude/velocity display below map, consecutive failure counter that clears interval after
  3 failures.
  - Suggested commit: `feat: add iss.js with Leaflet map and live ISS position polling`

- [ ] **Step 09 — crypto.js**
  Create `js/crypto.js`: CoinGecko markets fetch for 5 coins, Chart.js horizontal bar chart
  (24h % change, green/red bars), coin list rows with logo + name + price + 24h badge,
  60-second auto-refresh countdown with `setInterval`, Toastify toast on refresh.
  - Suggested commit: `feat: add crypto.js with CoinGecko data, Chart.js visualisation, and auto-refresh`

- [ ] **Step 10 — countries.js**
  Create `js/countries.js`: fetch all countries once from REST Countries API (store in module
  variable), random country picker, render flag image + name + region + fact pills (capital,
  population, area, languages, currency), "Discover another →" button with fade transition.
  - Suggested commit: `feat: add countries.js with REST Countries integration and random picker`

- [ ] **Step 11 — quote.js**
  Create `js/quote.js`: fetch random quote from DummyJSON, render decorative quote mark +
  quote text + author attribution, "New quote ↻" button with fade, fallback to embedded
  quotes array on API failure.
  - Suggested commit: `feat: add quote.js with DummyJSON integration and fallback quotes`

---

## Error Handling Rules

- Every API call must be wrapped in try/catch.
- On failure, show a muted `"Could not load data"` message in the widget body.
- Never crash or leave a widget in a broken state.
- Network errors should not throw uncaught exceptions.
- The ISS polling loop must clear its interval if the fetch fails 3 times consecutively.

---

## Notes for Claude Code

- Do not use any package manager, bundler, or build tool. Everything runs from the file system
  or a simple static server (e.g. `npx live-server` or VS Code Live Server).
- Use ES modules (`type="module"`) for all JavaScript files.
- CSS custom properties must be defined on `:root` and the `html.dark` selector.
- Do not hardcode colours anywhere in JS or HTML — always use the CSS variable names.
- Keep each JS file focused on a single widget. `app.js` only bootstraps.
- Target modern browsers (Chrome/Firefox/Edge latest). No IE11 compatibility needed.
- The Leaflet map container `#iss-map` must have an explicit height in CSS before `L.map()` is called, otherwise the map will not render.
- CoinGecko's public API has a rate limit of ~10-30 calls/minute. The 60-second refresh
  interval is deliberately chosen to stay well within this limit.
- REST Countries returns a large payload. Fetch it once, store in a module-level variable,
  do not re-fetch on country refresh.
