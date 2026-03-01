# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React component library for setting business hours in an admin panel. Supports multiple time periods per day, holidays, i18n localization, and configurable time increments. Built with React 18, Emotion CSS-in-JS, and Create React App.

## Commands

- `npm start` — Dev server on localhost:3000
- `npm test` — Jest test runner (watch mode)
- `npm test -- --watchAll=false` — Run tests once
- `npm run build` — Production build to `/build`

## Architecture

### Component Hierarchy
```
<BusinessHours>              — Main container, manages config props
  └── <BusinessHoursDay>     — One per day, manages hours state (useState)
      ├── <ToggleSwitch>     — Open/Closed toggle
      └── <BusinessHoursInput> — Time picker (datalist or select)
```

All components are in `src/components/`. Functional components with hooks and PropTypes validation.

### Data Format
Hours are stored as objects keyed by day name. Each day maps to an array of time period objects:
```json
{ "id": "unique-id", "open": "0800", "close": "1700", "isOpen": true }
```
Times use "HHmm" 24-hour format internally. Special values: `"24hrs"` (all day), `"2400"` (midnight, closing only), `""` (unset).

### Key Files
- `src/utils/helpers.js` — Time formatting/parsing (dayjs), time list generation, row position utilities
- `src/utils/validations.js` — Three-tier validation: format, ordering (open < close, no overlaps), special cases (midnight constraints)
- `src/data/` — Demo JSON data for the App.js showcase (4 demo configurations)
- `src/styles/` — Component CSS files (alongside Emotion styled components)

### Styling
Hybrid approach: Emotion `@emotion/styled` + `css` prop for dynamic styles, plus traditional CSS files in `src/styles/`.

### Localization
The `BusinessHours` component accepts a `localization` prop object containing all UI strings (day names, toggle labels, placeholders, error message templates). Default English localization is built in. Error messages use keys like `open.invalidInput`, `close.greaterThanNext`.
