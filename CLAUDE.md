# CLAUDE.md - React Business Hours

## Project Overview

React component for setting business hours in an administration panel. Originally ported from [Vue Business Hours](https://github.com/sbarry50/vue-business-hours). The component supports configurable time slots per day, toggle open/closed states, input validation, multiple input modes, i18n, and 12/24-hour time formats.

**Status:** Early development (v0.1.0, private). Last active development: May 2020.

**Live demo:** https://react-business-hours.netlify.com/

## Tech Stack

- **React** 16.13 (class + functional components, no hooks beyond built-in)
- **Create React App** 3.4.0 (webpack, babel, jest under the hood)
- **Emotion** (@emotion/core + @emotion/styled) for CSS-in-JS
- **Moment.js** for time parsing and formatting
- **FontAwesome** (react-fontawesome) for icons
- **PropTypes** for runtime type checking (no TypeScript)
- **uniqid** for generating unique IDs

## Quick Reference Commands

```bash
npm start          # Dev server on localhost:3000
npm test           # Jest in watch mode (via react-scripts)
npm run build      # Production build to /build
```

There is no custom ESLint, Prettier, Babel, or Webpack config — everything uses CRA defaults. ESLint extends `react-app` (configured in package.json).

## Project Structure

```
src/
├── components/
│   ├── business-hours.js          # Root component — iterates days, renders BusinessHoursDay
│   ├── business-hours-day.js      # Per-day row — toggle, time slots, add/remove rows
│   ├── business-hours-input.js    # Time input — datalist or select mode
│   ├── business-hours-datalist.js # Datalist variant (incomplete/unused, has Vue remnants)
│   └── toggle-switch.js           # Reusable toggle switch with customizable colors
├── data/
│   ├── demoDays.json              # Standard Mon–Sun business hours
│   ├── demoDaysErrors.json        # Hours with intentional validation errors
│   ├── demoDaysEmit.json          # Alternate demo data
│   ├── demoDaysSpanish.json       # Spanish-translated day data
│   ├── demoHolidays.json          # Holiday hours (Thanksgiving, Christmas, etc.)
│   └── demoSpanishLocalization.json # Spanish UI strings
├── styles/
│   ├── business-hours.css         # Container layout
│   ├── business-hours-day.css     # Day row flex layout, error styling
│   └── toggle-switch.css          # Toggle switch with responsive scaling
├── utils/
│   ├── helpers.js                 # Time format conversion, row/input position checks
│   ├── validations.js             # Validation engine (invalidInput, greaterThanNext, etc.)
│   └── forms.js                   # Legacy/incomplete — mixed Vue+React, not integrated
├── App.js                         # Demo page rendering 3 BusinessHours variants
├── App.test.js                    # Single smoke test (renders App)
├── index.js                       # React DOM entry point
└── setupTests.js                  # Imports @testing-library/jest-dom
```

## Architecture & Key Patterns

### Component Hierarchy

```
App
└── BusinessHours (functional)            — props: days, name, timeIncrement, type, color, ...
    └── BusinessHoursDay (class)          — per-day state: hours[], validations[], isOpen
        ├── ToggleSwitch (class)          — open/closed toggle
        └── BusinessHoursInput (class)    — time input (datalist or select dropdown)
```

### Data Flow

- **Input format (backend):** Times stored as 4-digit strings: `"0800"`, `"1700"`, `"2400"` (midnight), `"24hrs"`
- **Display format (frontend):** `"08:00 AM"`, `"05:00 PM"`, `"Midnight"`, `"24 hours"` (or 24h equivalents)
- Conversion handled by `helpers.frontendInputFormat()` / `helpers.backendInputFormat()`
- Days data is a JSON object keyed by day name, each value is an array of `{open, close, id, isOpen}` objects
- Parent receives updates via the `updatedValues` callback prop

### Validation System (`utils/validations.js`)

Four validation checks per time input:
1. **invalidInput** — value doesn't match expected time format
2. **greaterThanNext** — opening time >= closing time
3. **lessThanPrevious** — time <= previous adjacent time
4. **midnightNotLast** — midnight ("2400") used in non-final slot

Validations cascade: when one input is invalid, adjacent input validations update automatically via `updateAdjacentValidations()`.

### Styling

Mixed approach:
- **Emotion styled-components** for component-scoped dynamic styles (color props, toggle states)
- **CSS files** in `src/styles/` for layout and shared styles
- Responsive breakpoints: 991px, 767px, 575px
- Primary color default: `#2779bd` (configurable via `color` prop)

## BusinessHours Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `days` | object (required) | — | Day/hours data object |
| `name` | string | `"businessHours"` | Form field name prefix |
| `timeIncrement` | 15 \| 30 \| 60 | `30` | Minutes between time options |
| `type` | `"datalist"` \| `"select"` | `"datalist"` | Input mode |
| `color` | string | `"#2779bd"` | Accent color for toggle and buttons |
| `switchWidth` | number | `90` | Toggle switch width in px |
| `hourFormat24` | bool | `false` | Use 24-hour time display |
| `localization` | object | English defaults | UI strings for i18n |
| `updatedValues` | func | identity | Callback when hours change |

## Known Issues & Incomplete Areas

- `business-hours-datalist.js` contains Vue-style syntax remnants and is not integrated
- `utils/forms.js` has mixed Vue/React patterns and uses `this` in a non-class context — not actively used
- Test coverage is minimal (single smoke test in `App.test.js`)
- The App.test.js test checks for "learn react" text which doesn't exist in the current App component
- Spanish translation demo is commented out in App.js

## Development Notes

- No CI/CD pipeline configured
- No TypeScript — use PropTypes for type checking
- Both `package-lock.json` and `yarn.lock` exist; prefer npm (package-lock.json is more recent)
- Node modules are not committed (install with `npm install` before running)
- The project is `"private": true` — not published to npm
