# Atlas Sectoria · Orszaglexikon

A vintage-cartographic country encyclopedia. The world's countries in one volume — with flag, population, an interactive map, and a side-by-side comparison view.

## Stack

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS 4 (CSS-first `@theme`)
- React Router 7
- Zustand 5 with `persist` (theme · locale · compare list)
- TanStack Query v5 (REST Countries v3.1)
- Leaflet 1.9 + react-leaflet 5 (OpenStreetMap tiles + GeoJSON country highlight)
- Motion v12 (page transitions, stagger reveals)
- Self-hosted variable fonts: Fraunces · Inter Tight · JetBrains Mono

## Features

- **Country list** — search, region filter, sortable grid
- **Country detail** — flag, drop-cap intro, quick-stat ledger, interactive map, languages, currencies, neighbouring countries
- **Comparison** — up to 4 countries side-by-side with relative-magnitude bars and a "winner" tick per metric
- **Bilingual UI** — Hungarian + English toggle, locale-aware number formatting, localized country names
- **Light + dark theme** — _Parchment Edition_ and _Observatory Edition_

## Aesthetic — "Atlas Sectoria"

Modern editorial atlas. Cream parchment, ink navy, oxblood + ochre accents. Hairline rules and small-caps "PLATE I, II, III…" labels. Compass rose in the header. Latitude tick decorations between sections.

## Scripts

```bash
npm install      # install deps
npm run dev      # vite dev server
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm run preview  # preview production build
```

## Project layout

```
src/
  api/         REST Countries client
  components/  layout · ui · country · search · map · compare
  hooks/       useCountries · useCountry
  i18n/        HU + EN strings, useT()
  lib/         format · countries · cn
  pages/       Home · CountryDetail · Compare · NotFound
  router/      data router config
  store/       theme · locale · compare (Zustand + persist)
  types/       Country interface
```

## Data

Public REST Countries v3.1 — one list call cached forever, detail pages read from the cache. Hungarian country names come from `translations.hun.common`.

Country borders for the map: `world-atlas` GeoJSON.
