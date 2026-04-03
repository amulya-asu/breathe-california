# Frontend Design Skill — CA AQI Forecast Dashboard

## Concept: "Air You Can See"
The interface makes invisible air quality visible. The background itself IS the data — particles, color, and motion communicate AQI state before the user reads a single number. Clean air feels alive and bright. Polluted air feels heavy and oppressive.

---

## Aesthetic Direction

- **Style:** Glassmorphism on animated canvas — Apple Weather meets environmental data
- **Mood:** Calm, informational, never alarming — even bad AQI is communicated clearly, not dramatically
- **Differentiation:** The background changes meaning with data. No other element needs to work as hard.

---

## Typography

```css
--font: 'Nunito', sans-serif;
```

| Use | Weight | Size | Notes |
|---|---|---|---|
| Hero county name | 300 | 38px | Light, airy |
| AQI large number | 200 | 96px | Ultra-thin — feels like weather app |
| Body / descriptions | 400 | 14px | Comfortable reading weight |
| Labels / nav | 500 | 13–14px | Slightly heavier for legibility on glass |
| Section titles | 500 | 12px | Uppercase, letter-spacing 0.8px |

**Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600&display=swap" rel="stylesheet"/>
```

**NEVER use:** Inter, Roboto, Arial, Space Grotesk, system-ui

---

## Color System

All text is white at varying opacity levels — no separate text colors needed. Theme is expressed through the background, not the foreground.

```css
:root {
  /* Text */
  --text-primary:   #ffffff;
  --text-secondary: rgba(255,255,255,0.55);
  --text-tertiary:  rgba(255,255,255,0.38);
  --text-hint:      rgba(255,255,255,0.28);

  /* Glass surfaces */
  --glass:          rgba(255,255,255,0.07);
  --glass-strong:   rgba(255,255,255,0.11);
  --glass-border:   rgba(255,255,255,0.13);
  --glass-border-hi:rgba(255,255,255,0.24);
  --glass-hover:    rgba(255,255,255,0.14);

  /* AQI semantic colors */
  --aqi-good:       #3a7d44;
  --aqi-moderate:   #fdb515;
  --aqi-sensitive:  #e8581a;
  --aqi-unhealthy:  #c0392b;
  --aqi-hazardous:  #7e0023;

  /* Border radius */
  --radius-card:    20px;
  --radius-inner:   14px;
  --radius-pill:    24px;
}
```

### AQI Color Helper
```js
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
```

---

## Animated Background System

The canvas background is the most important design element. It must always be running.

### Theme Definitions

| Theme | Base BG | Particle Type | Particle Colors | Feel |
|---|---|---|---|---|
| `good` | `#041a0c` | Small rising dots + glow halos | `#00ff88` `#00cc66` `#00aa44` | Fireflies, alive, clean |
| `moderate` | `#1a1000` | Large slow drifting blobs | `#ffcc00` `#ffaa00` `#ff8800` | Golden haze, warm smog |
| `sensitive` | `#1a0800` | Large heavy blobs, slower | `#ff6600` `#ff4400` `#ff8833` | Orange murk, heavy air |
| `unhealthy` | `#1a0000` | Large oppressive blobs, very slow | `#ff2200` `#cc0000` `#ff4433` | Red murk, dangerous feel |

### Overlay Gradients (on div above canvas)
```css
.overlay-good      { background: linear-gradient(160deg, rgba(0,40,20,0.55), rgba(0,20,10,0.80)); }
.overlay-moderate  { background: linear-gradient(160deg, rgba(40,28,0,0.55), rgba(25,16,0,0.80)); }
.overlay-sensitive { background: linear-gradient(160deg, rgba(50,18,0,0.55), rgba(30,10,0,0.82)); }
.overlay-unhealthy { background: linear-gradient(160deg, rgba(50,0,0,0.60),  rgba(28,0,0,0.85)); }
```

### Particle Specs
```js
// Good — firefly dots
{ count: 80, r: 1–3px, vy: -(0.1–0.5), vx: ±0.2, alpha: 0.3–1.0 }
// Draw: arc + radial glow halo (radius × 5, alpha × 0.2)
// Reset: when y < -10, reset to bottom

// Moderate / Sensitive / Unhealthy — smog blobs
{ count: 100–120, r: 20–80px, vx: ±0.15, vy: ±0.12, alpha: 0.04–0.22 }
// Draw: radialGradient circle — opaque center, transparent edge
// Wrap edges on all sides
```

### Animation Rules
- Always use `requestAnimationFrame`
- Cancel loop on `prefers-reduced-motion` — set canvas `display: none`, show static dark bg
- On theme change: cancel old loop, reinitialize particles, start new loop
- Canvas must `resize()` on `window.resize`

---

## Glass Component Pattern

Every card/panel follows this pattern:

```css
/* Standard glass */
.glass {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 20px;
}

/* Hero / Chat — stronger glass */
.glass-strong {
  background: rgba(255,255,255,0.11);
  backdrop-filter: blur(32px) saturate(190%);
  -webkit-backdrop-filter: blur(32px) saturate(190%);
  border: 1px solid rgba(255,255,255,0.17);
  border-radius: 20px;
}
```

**Inner elements** (pills, hour cards, day cards) use `border-radius: 14px`
**Pills** (badges, tabs, select) use `border-radius: 24px`
**Never** use solid backgrounds on cards — glass only

---

## Component Patterns

### County Select
```css
background: rgba(255,255,255,0.10);
border: 1px solid rgba(255,255,255,0.18);
border-radius: 20px;
color: white;
```

### Status Badge
```css
background: rgba(255,255,255,0.14);
border: 1px solid rgba(255,255,255,0.20);
border-radius: 20px;
color: white;
font-size: 13px;
font-weight: 500;
```
Badge is always white — AQI color signal comes from background theme, not badge color.

### Hour / Day Cards
```css
background: rgba(255,255,255,0.07);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 14px;
```
Active/now state:
```css
background: rgba(255,255,255,0.18);
border: 1px solid rgba(255,255,255,0.28);
```

### AQI Scale Bar
```css
background: linear-gradient(to right, #3a7d44, #fdb515, #e8581a, #c0392b, #7e0023);
height: 6px;
border-radius: 3px;
```
White dot marker: `left: ${Math.min(aqi/300*100, 98)}%`, transitions with `cubic-bezier(0.4,0,0.2,1)`

### Chat Bubbles
```css
/* Bot */
background: rgba(255,255,255,0.09);
border: 1px solid rgba(255,255,255,0.11);
border-bottom-left-radius: 4px;   /* tail */

/* User */
background: rgba(255,255,255,0.20);
border: 1px solid rgba(255,255,255,0.18);
border-bottom-right-radius: 4px;  /* tail */
```

### Tab Switcher
```css
/* Container */
background: rgba(255,255,255,0.08);
border-radius: 20px;
padding: 3px;

/* Active tab */
background: rgba(255,255,255,0.17);
border-radius: 18px;
color: white;
```

---

## Animation Rules

| Animation | Spec | When |
|---|---|---|
| Page load stagger | fade-up, 150ms delay between elements | Hero mount only |
| County switch | background transitions 2s CSS | On county select change |
| Scale dot slide | `transition: left 0.9s cubic-bezier(0.4,0,0.2,1)` | On county change |
| Typing dots | CSS `@keyframes blink`, 1.2s, staggered 0.2s | While awaiting chat response |
| Tab active | `transition: all 0.2s` | On tab click |

**Always use** `transform` and `opacity` for JS animations — never `width`, `height`, `top`, `left` except for the scale dot (intentional slide).

**`prefers-reduced-motion`:** Cancel canvas loop entirely. All CSS transitions set to `none`.

---

## Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| `< 768px` | Hide nav links → hamburger overlay; hero AQI row stacks vertically; weather pills 2-col; weekly grid 4-col |
| `< 480px` | Hero top row stacks; weekly grid 2-col |

Use `clamp()` for the AQI big number:
```css
font-size: clamp(64px, 12vw, 96px);
```

---

## Contrast Verification

All text is white on glass — glass sits on dark animated background.
Minimum effective background darkness: `#041a0c` (good theme, lightest).

| Text opacity | Hex approx | Contrast vs #041a0c | Pass |
|---|---|---|---|
| 100% white | `#ffffff` | 19.5:1 | ✅ AAA |
| 55% white | `rgba(255,255,255,0.55)` | ~9.2:1 | ✅ AA |
| 38% white | `rgba(255,255,255,0.38)` | ~5.8:1 | ✅ AA |
| 28% white | `rgba(255,255,255,0.28)` | ~4.1:1 | ⚠️ Footer only — decorative |

---

## What to NEVER Do

- No solid dark backgrounds on cards — glass only
- No colored text (except AQI dot indicators) — everything is white at opacity
- No border-radius below 14px on cards — sharp corners don't fit the aesthetic
- No drop shadows — glass + blur is the depth system
- No Inter, Roboto, Arial, Space Grotesk
- No skeleton loaders — show spinner or typing dots instead
- No purple, lavender, or teal — AQI colors only (green/gold/orange/red)
- No static background — canvas must always animate (unless reduced-motion)
- No separate light mode — this UI is dark-only by design

---

## Stub Data Shape

```js
export const COUNTIES = {
  'Fresno': {
    aqi: 87, pm: 23.4, tmr: 26.1,
    status: 'Moderate', theme: 'moderate',
    desc: 'Air quality is acceptable. Sensitive individuals should reduce prolonged outdoor exertion.',
    temp: '28.4°C', wind: '3.1 m/s', humidity: '42%', pressure: '1013 hPa',
    hourly: [20,18,16,15,14,13,14,17,22,26,30,33,36,38,36,32,29,26,23,21,19,18,17,16],
  },
  // ... other counties
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
  // ... other counties
};

export const CHAT_RESPONSES = [
  { keywords: ['jog','run','exercise','walk','bike'], handler: (county) => `...` },
  { keywords: ['park','kids','children','family'],    handler: (county) => `...` },
  { keywords: ['tomorrow'],                           handler: (county) => `...` },
  { keywords: ['weekend','saturday','sunday'],        handler: (county) => `...` },
  { keywords: ['compare','vs','versus'],              handler: ()       => `...` },
  // city-specific handlers for LA, SF, Sacramento, Bakersfield
];
```

---

## File Structure

```
src/
├── components/
│   ├── Background.jsx   ← canvas particle engine
│   ├── Nav.jsx
│   ├── Hero.jsx         ← owns county state, triggers theme change
│   ├── HourlyStrip.jsx
│   ├── WeeklyGrid.jsx
│   ├── ChatBar.jsx
│   └── Footer.jsx
├── utils/
│   └── aqi.js           ← aqiColor(), aqiTheme(), aqiLabel()
├── stubs/
│   └── data.js          ← COUNTIES, WEEKLY, CHAT_RESPONSES
├── App.jsx              ← lifts county + theme state
└── index.css            ← CSS variables only
```