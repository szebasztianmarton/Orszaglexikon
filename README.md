# Atlas Sectoria · Orszaglexikon

A vintage-cartographic country encyclopedia. The world's countries in one volume — with flag, population, an interactive map, and a side-by-side comparison view.

**Demo:** [orszaglexikon.netlify.app](https://orszaglexikon.netlify.app/)

# Stack

![React 19](https://img.shields.io/badge/React_19-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript 6](https://img.shields.io/badge/TypeScript_6-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite 8](https://img.shields.io/badge/Vite_8-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS_4-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router 7](https://img.shields.io/badge/React_Router_7-%23CA4245.svg?style=for-the-badge&logo=react-router&logoColor=white)
![Zustand 5](https://img.shields.io/badge/Zustand_5_(Persist)-%23413D3D.svg?style=for-the-badge)
![TanStack Query v5](https://img.shields.io/badge/TanStack_Query_v5-%23FF4154.svg?style=for-the-badge&logo=react-query&logoColor=white)
![Leaflet 1.9 + React Leaflet 5](https://img.shields.io/badge/Leaflet_1.9_%2B_React_Leaflet_5-%23199900.svg?style=for-the-badge&logo=leaflet&logoColor=white)
![Motion v12](https://img.shields.io/badge/Motion_v12-%230055FF.svg?style=for-the-badge&logo=framer&logoColor=white)
![REST Countries v3.1](https://img.shields.io/badge/REST_Countries_v3.1-%23000000.svg?style=for-the-badge&logo=json&logoColor=white)
![Variable Fonts](https://img.shields.io/badge/Fonts-Fraunces_|_Inter_Tight_|_JetBrains_Mono-%234A90E2.svg?style=for-the-badge)

## Features

- **Country list** — search, region filter, sortable grid
- **Country detail** — flag, drop-cap intro, quick-stat ledger, interactive map, languages, currencies, neighbouring countries
- **Comparison** — up to 4 countries side-by-side with relative-magnitude bars and a "winner" tick per metric
- **Bilingual UI** — Hungarian + English toggle, locale-aware number formatting, localized country names
- **Light + dark theme** — _Parchment Edition_ and _Observatory Edition_

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
