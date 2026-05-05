# Atlas Sectoria — Orszaglexikon

## Projektdokumentáció

> 6. szemeszter · Szoftverprojekt
> React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 4

---

## Tartalomjegyzék

1. [Bevezetés](#1-bevezetés)
2. [Funkcionális követelmények és megvalósítás](#2-funkcionális-követelmények-és-megvalósítás)
3. [Műszaki architektúra](#3-műszaki-architektúra)
4. [Adatforrások](#4-adatforrások)
5. [Mappastruktúra](#5-mappastruktúra)
6. [Komponens-katalógus](#6-komponens-katalógus)
7. [Állapotkezelés](#7-állapotkezelés)
8. [Útvonalak (routing)](#8-útvonalak-routing)
9. [Stílusrendszer — Atlas Sectoria](#9-stílusrendszer--atlas-sectoria)
10. [Lokalizáció (HU / EN)](#10-lokalizáció-hu--en)
11. [Telepítés és futtatás](#11-telepítés-és-futtatás)
12. [Build és deploy](#12-build-és-deploy)
13. [Tesztelési ellenőrzőlista](#13-tesztelési-ellenőrzőlista)
14. [Lehetséges bővítések](#14-lehetséges-bővítések)
15. [Függelék](#15-függelék)

---

## 1. Bevezetés

### 1.1 A projekt célja

Az **Atlas Sectoria** — kódnévvel **Orszaglexikon** — egy modern, kétnyelvű (magyar / angol) web-alkalmazás, amely a világ országainak részletes adatait teszi böngészhetővé. A felhasználó kereshet, szűrhet, nagyíthat egy interaktív világtérképen, és akár négy országot is összehasonlíthat egymás mellett.

A projekt fő célja egy **olyan webes alkalmazás bemutatása**, amely:

- modern frontend-eszközöket alkalmaz (React 19, TypeScript, Tailwind CSS v4),
- valódi nyilvános REST API-ra épít (REST Countries v3.1),
- interaktív térképes vizualizációt nyújt (Leaflet + d3-geo),
- gondos, megkülönböztethető vizuális tervezést képvisel (vintage-térkép-atlasz esztétika),
- robusztusan működik ofline-helyzetekben is (snapshot-alapú adatkezelés).

### 1.2 Az alkalmazás rövid áttekintése

Négy fő képernyő:

| Útvonal | Oldal | Funkció |
|---|---|---|
| `/` | Kezdőlap (HomePage) | Keresés, régiószűrő, rendezés, ország-rács |
| `/terkep` | Térkép (MapPage) | Interaktív SVG világtérkép, zoom/pan, oldalsó panel |
| `/orszag/:cca3` | Ország-részletek (CountryDetailPage) | Zászló, statisztika, Leaflet-térkép, szomszédok |
| `/osszehasonlitas` | Összehasonlítás (ComparePage) | 1–4 ország egymás mellett, bar-chart vizualizációval |

A felhasználó bármikor válthat:
- nyelvet (magyar ↔ angol — beleértve az országneveket is),
- témát (világos *Pergamen* ↔ sötét *Obszervatórium*).

A választott nyelv, téma és összehasonlítási lista `localStorage`-ben perzisztens.

### 1.3 Tantárgyi kontextus

A projekt **6. szemeszteres szoftverprojekt** keretében készült. A követelmények közé tartozott:

- önálló tervezési és implementációs munka,
- modern webes technológiai stack,
- tiszta kódszerkezet, dokumentáció,
- demonstrálható futtatható végtermék.

---

## 2. Funkcionális követelmények és megvalósítás

### 2.1 Ország-katalógus (Kezdőlap)

| Funkció | Megvalósítás |
|---|---|
| **Keresés** szövegesen | `matchesQuery()` egyezteti a beírt szöveget a név (lokalizált + angol), hivatalos név, főváros, régió, alrégió, cca2, cca3 mezőkkel |
| **Régió-szűrő** | Hat régió (Afrika, Amerika, Ázsia, Európa, Óceánia, Antarktisz) + „Mind" |
| **Rendezés** | Ábécé (lokalizált `localeCompare`-rel), lakosság, terület |
| **Találatok száma** | Élő számláló, magyar / angol formázásban |
| **Hozzáadás összehasonlításhoz** | Minden kártyán + gomb (oxblood pipa-ikon, ha már szerepel) |

A szűrés és rendezés kliens-oldalon történik, `useMemo`-val. Mivel az adatok statikus snapshotból jönnek, ez gyors és reszponzív.

### 2.2 Ország részletei (Részletoldal)

A részletoldal egy „kötet-tábla" (Plate II – V) szerkezetben jeleníti meg az adatokat:

- **Hős-rész**: lokalizált név (Fraunces 60 px), hivatalos név (kurzív), zászló (vignettával), gyors-mutatók ledger-szerű elrendezésben (főváros, lakosság, terület, népsűrűség, régió, alrégió, koordináták).
- **Plate III · Geographia**: interaktív Leaflet térkép, OpenStreetMap csempékkel, az ország határa GeoJSON-poligonként kiemelve (oxblood vonal, 18 % alpha-fill).
- **Plate IV · Lingua & Currencia**: nyelvek (címke + név), pénznemek (szimbólum, név, ISO-kód).
- **Plate V · Confinia**: szomszédos országok mini-kártyái (zászló-thumb + lokalizált név + ISO3 kód), kattintható linkek.

### 2.3 Interaktív világtérkép (Térkép-oldal)

Az `Atlas Sectoria` egyik központi UX-eleme egy **inline SVG világtérkép** Equal-Earth vetítéssel.

| Tulajdonság | Részlet |
|---|---|
| **Vetítés** | `d3-geo` `geoEqualEarth()`, `fitSize` 960 × 500 viewBox-hoz |
| **Adatforrás** | `world-atlas/countries-50m.json` TopoJSON (~750 KB), `topojson-client.feature()` konvertálja FeatureCollection-né |
| **Hover** | Ország kiemelése okkerre, követő tooltippel (név, régió, lakosság) |
| **Kattintás** | Ország kiválasztása oxblood-fillel + drop shadow; ismételt kattintás kikapcsolja |
| **Zoom** | Egér-görgő, kurzor felé közelít (kurzor-kötött zoom), 1× – 24× tartomány |
| **Pan** | Kattintás + húzás (a 2 px alatti elmozdulás kattintásnak számít, nem zavarja a kiválasztást) |
| **Zoom-vezérlők** | + / − / reset gomb a jobb felső sarokban; aktuális zoom-szint kijelzés |
| **Bound-clamp** | A pan korlátozott, így nem lehet kicsúszni a Föld széle mellé |
| **Színezés** | Egyszerű / Lakosság szerint / Terület szerint (logaritmikus, `oklab` color-mix-szel) |
| **URL-állapot** | A kiválasztott ország a `?o=HUN` query-paraméterben rögzítve, így linkelhető |
| **Vonalak** | `vector-effect="non-scaling-stroke"` — zoomolásnál a határvonalak végig hajszálvékonyak maradnak |
| **Tooltip** | Pan közben elrejtődik, így nem zavar |

A térképhez tartozik egy **oldalsó panel**, amely a kiválasztott országot jeleníti meg (lokalizált név, hivatalos név, zászló, statisztikák, nyelvek, pénznemek, „Megnyitás" + „Hozzáadás" akciógombok). Az ürességállapotban illusztrált *Terra Vacua*-üzenet jelenik meg.

### 2.4 Összehasonlítás

A felhasználó **1–4 ország**-ot adhat hozzá az összehasonlítási listához, bárhonnan (kezdőlap-kártya, részletoldal, térkép-panel). A beállítás `localStorage`-ben perzisztens.

**Lebegő drawer**: minden oldal alján sticky drawer mutatja az aktuális kiválasztást (zászló-thumb + ország-név + eltávolítás-gomb), benne „Megnyitás (N)" CTA. Kapacitás-jelzés (`2 / 4`).

**Összehasonlító oldal** (`/osszehasonlitas`):

- Oszlop-fejek 1–4 országgal (zászló + lokalizált név + szín-jelölés). Az oszlopok max. 320 px szélesek, így 1 ország kiválasztásakor sem nyúlik szét aránytalanul a zászló.
- **Bar-chart vizualizáció** három metrikán: lakosság, terület, népsűrűség.
- A relatív magnitúdók skála-arányosan vannak rajzolva, a sor maximumát „nyertes-háromszög" jelöli (okker).
- Slot-színek: oxblood, atlas-blue, okker, moss — vizuális kapcsolat az oszlop és a bar között.

### 2.5 Lokalizáció

Két nyelv: **magyar** és **angol**. A váltás a fejléc HU/EN-toggle-ével történik, és perzisztens.

**Mit cserél**:

- Minden UI-felirat (cím, gombok, mezőcímkék, üzenetek)
- Ország-megjelenített név: HU → `country.translations.hun.common` (pl. „Magyarország"); EN → `country.name.common` (pl. „Hungary")
- Hivatalos név: hasonlóan a `translations.hun.official` mezőből
- Szám-formázás: HU → `9 957 731` (NBSP-elválasztó), EN → `9,957,731` (vessző) — `Intl.NumberFormat`-tal
- Régió-feliratok: HU → „Európa", EN → „Europe", stb.
- Koordináta-formázás: tizedesvessző / tizedespont régió szerint

A lokalizáció megoldása **könyvtárfüggetlen**: tipizált stringtáblák HU + EN változatban (`src/i18n/strings.ts`), a `useT()` hook visszaadja az aktív lokalizáció stringjeit. Egy szakdolgozati méretű projekthez ez egyszerűbb és átláthatóbb, mint például az `i18next`.

### 2.6 Téma (világos / sötét)

Két téma, **CSS-változókkal** váltható:

- **Pergamen-kiadás** (világos): krémszín alap (#F4EDE0), tinta-navy szöveg (#1A2434), oxblood / okker / atlasz-kék kiemelések.
- **Obszervatórium-kiadás** (sötét): mély tinta-kék alap (#0F1620), meleg krémszöveg (#E8DECB), élénkebb kiemelő-színek.

A téma-osztály (`.dark`) szinkron módon kerül a `<html>`-re már a modul betöltésekor (FOUC-prevention), tehát oldal-frissítéskor **nincs villanás**.

### 2.7 Perzisztencia

`Zustand` `persist`-middleware-rel három tárolóra:

- `orszaglexikon-fullai-theme`: `'light' | 'dark'`
- `orszaglexikon-fullai-locale`: `'hu' | 'en'`
- `orszaglexikon-fullai-compare`: `string[]` (cca3 kódok, max 4)

---

## 3. Műszaki architektúra

### 3.1 Technológiai stack

| Réteg | Eszköz | Verzió | Indoklás |
|---|---|---|---|
| Build | **Vite** + `@vitejs/plugin-react` | 8.x | Modern, gyors, oxc-alapú HMR |
| Framework | **React** | 19.2.5 | Suspense, useTransition, server actions (jelenleg client-only) |
| Nyelv | **TypeScript** | 6.0 | Erős típusosság, IDE-támogatás |
| CSS | **Tailwind CSS** | 4.2 | CSS-first `@theme`, custom-variant `dark` |
| Routing | **React Router** | 7.1 | Data router, `createBrowserRouter` |
| Állapotkezelés | **Zustand** | 5.0 | Minimalista, persist-middleware, React 19-kompatibilis |
| Adatkérés / cache | **TanStack Query** | 5.59 | Suspense-támogatás, retry, gc, queryKey-cache |
| Térkép (részletoldal) | **Leaflet** + **react-leaflet** | 1.9 / 5.0 | OSM-csempék, GeoJSON-réteg |
| Térkép (világ) | **d3-geo** + **topojson-client** + **world-atlas** | 3.1 / 3.1 / 2.0 | SVG-vetítés, kompakt TopoJSON |
| Animáció | **Motion** | 12.0 | Page-transition, stagger reveal |
| Betűtípusok | **@fontsource-variable/{fraunces,inter-tight,jetbrains-mono}** | 5.1 | Self-hosted, offline-képes |
| Linting | **ESLint** + `typescript-eslint` + `eslint-plugin-react-hooks` | 10 / 8 / 7 | Flat config |

### 3.2 Adatfolyam-modell

```
[ public/countries.json ]                  [ world-atlas (npm) ]
        ▼                                          ▼
   fetchAllCountries()                fetchCountriesGeoJSON()
        ▼                                          ▼
   useCountries() ────────► TanStack Query cache ◄─── useCountriesGeoJSON()
        ▼                          (Infinity stale)        ▼
   useCountry(cca3) (filter)                          CountryMap / WorldMap
        ▼                                                  ▼
   HomePage / Detail / Compare / Map ───────►  Render (React + Tailwind)
                          │
                          ▼
                  compareStore (Zustand + persist)
                          ▲
                          │
                  localeStore + themeStore
```

### 3.3 Adatfetch-stratégia

- A teljes ország-listát **egyszer** kérjük le (`useCountries`), és a TanStack Query végtelen ideig (`staleTime: Infinity`) cache-eli.
- Az egyes részletoldalak nem fetch-elnek külön — a `useCountry(cca3)` egyszerűen szűr a már cache-elt listából. **Eredmény**: navigáció lényegében azonnali, hálózati körök nélkül.
- A világtérkép GeoJSON-ja **lazy load** (`await import('world-atlas/countries-50m.json')`), tehát csak akkor töltődik le, ha a felhasználó eljut egy térképet tartalmazó oldalra. Külön JS-chunk-ba kerül (~243 KB gz).

---

## 4. Adatforrások

### 4.1 REST Countries v3.1

Nyilvános, autentikáció-mentes API: <https://restcountries.com/v3.1>.

**Kihívások**:

- A `/all` végpont **CORS-fejléceket nem ad**, ezért a böngészőből közvetlen fetch nem lehetséges.
- A `?fields=` paraméter **maximum 10 mezőt** enged kérni — túl korlátozó, mert nekünk 19 mező kell.

**Megoldás — snapshot**: az `/independent?status=true` és `/independent?status=false` végpontok teljes rekordokat adnak. Ezeket egyszer letöltöttük, egyesítettük, és [public/countries.json](public/countries.json) néven elhelyeztük (843 KB, 250 ország). A frontend statikus fájlként olvassa.

A snapshot újragenerálási parancsa:

```bash
curl -s "https://restcountries.com/v3.1/independent?status=true"  -o a.json
curl -s "https://restcountries.com/v3.1/independent?status=false" -o b.json
node -e "const a=require('./a.json'),b=require('./b.json'); \
require('fs').writeFileSync('public/countries.json', \
JSON.stringify([...a,...b].sort((x,y)=>x.name.common.localeCompare(y.name.common))))"
rm a.json b.json
```

**Magyar nevek**: a `translations.hun.common` és `translations.hun.official` mezőkből (pl. „Magyarország", „Magyar Köztársaság").

### 4.2 world-atlas TopoJSON

Az ország-határokhoz a [world-atlas](https://www.npmjs.com/package/world-atlas) NPM-csomagot használjuk (~750 KB, 50m felbontás). Ez TopoJSON-formátumú, a `topojson-client.feature()` konvertálja `FeatureCollection`-né.

A feature-ek `id` mezője az **M49 numerikus ország-kód** (Magyarország = `"348"`), ami pontosan megegyezik a REST Countries `ccn3` mezőjével — így a párosítás triviális.

Korábbi alternatíva (elvetve): `geo-countries` GeoJSON GitHubról, **14 MB**. A `world-atlas` ~25× kisebb és lazy-loadolva van.

---

## 5. Mappastruktúra

```
Orszaglexikon_FULLAI/
├── public/
│   ├── countries.json          REST Countries-snapshot (843 KB, 250 ország)
│   ├── favicon.svg             iránytű-rózsa
│   ├── paper-grain.svg         pergamen-textúra (zaj-szűrő)
│   ├── topo-lines.svg          dekoratív kontúrvonalak
│   └── _redirects              Netlify SPA-fallback
│
├── src/
│   ├── main.tsx                React mount + QueryClientProvider
│   ├── App.tsx                 RouterProvider
│   ├── index.css               Tailwind v4 @theme + fontok + Leaflet override-ok
│   │
│   ├── api/
│   │   └── countries.ts        Snapshot-fetch + TopoJSON-loader
│   │
│   ├── types/
│   │   └── country.ts          Country interface (REST Countries séma)
│   │
│   ├── store/
│   │   ├── themeStore.ts       light/dark, FOUC-safe
│   │   ├── localeStore.ts      hu/en
│   │   └── compareStore.ts     cca3[], max 4
│   │
│   ├── i18n/
│   │   ├── strings.ts          HU + EN tipizált stringtáblák
│   │   └── useT.ts             hook
│   │
│   ├── lib/
│   │   ├── format.ts           Intl-formázók
│   │   ├── countries.ts        getDisplayName, getDensity, sortCountries, ...
│   │   └── cn.ts               className-kombinálás
│   │
│   ├── hooks/
│   │   ├── useCountries.ts     TanStack Query: lista + GeoJSON
│   │   └── useCountry.ts       szűrés a cache-ből
│   │
│   ├── router/
│   │   └── routes.tsx          útvonalak
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── RootLayout.tsx  Header + Outlet + Footer + CompareDrawer
│   │   │   ├── Header.tsx      iránytű-márka, nav, HU/EN, téma
│   │   │   ├── Footer.tsx      colophon
│   │   │   └── PageFrame.tsx   topo-rétegek + tartalom-keret
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Compass.tsx
│   │   │   ├── PlateLabel.tsx
│   │   │   ├── LatitudeRule.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── LanguageToggle.tsx
│   │   ├── search/
│   │   │   ├── SearchInput.tsx
│   │   │   ├── RegionFilter.tsx
│   │   │   └── SortControl.tsx
│   │   ├── country/
│   │   │   ├── CountryCard.tsx
│   │   │   ├── CountryDescription.tsx (drop-cap)
│   │   │   ├── DataPair.tsx (okker pontvonal-vezetővel)
│   │   │   ├── LanguagePills.tsx
│   │   │   ├── CurrencyList.tsx
│   │   │   ├── BorderingCountries.tsx
│   │   │   └── CountryPanel.tsx (térkép-oldali panel)
│   │   ├── map/
│   │   │   ├── CountryMap.tsx (Leaflet, részletoldali)
│   │   │   └── WorldMap.tsx   (SVG, d3-geo, zoom + pan)
│   │   └── compare/
│   │       ├── CompareDrawer.tsx
│   │       ├── CompareSlot.tsx
│   │       ├── CompareTable.tsx
│   │       └── CompareBarChart.tsx
│   │
│   └── pages/
│       ├── HomePage.tsx
│       ├── MapPage.tsx
│       ├── CountryDetailPage.tsx
│       ├── ComparePage.tsx
│       └── NotFoundPage.tsx
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json + tsconfig.app.json + tsconfig.node.json
├── eslint.config.js
├── .nvmrc                      Node 22
├── README.md                   Rövid áttekintés
└── DOKUMENTACIO.md             Ez a fájl
```

---

## 6. Komponens-katalógus

### 6.1 Layout-komponensek

| Komponens | Felelősség |
|---|---|
| `RootLayout` | Az alkalmazás-keret. Headert, Outlet-et (aktív oldal), Footert és CompareDrawer-t renderel. |
| `Header` | Márka (iránytű-rózsa + Atlas Sectoria felirat), navigáció (Országok / Térkép / Összehasonlítás), HU/EN-toggle, téma-toggle. Az `Outlet`-en kívüli oldalakon szélességkorlátos (1240 px). |
| `Footer` | Atlasz-stílusú colophon, év, „Plate · Z" jelölés. |
| `PageFrame` | A tartalom-keret. Opcionálisan topographic-vonalakat húz a háttérbe (`withTopo` prop). |

### 6.2 Atomic UI

| Komponens | Cél |
|---|---|
| `Button` | Variánsok: solid (tinta-fillel), outline, ghost. Méretek: sm/md/lg. |
| `Compass` | SVG iránytű-rózsa, paraméterezhető méret. Headerben. |
| `PlateLabel` | Kis-kapitális „Plate I", „Plate II" felirat, okker rombusz-előjellel (`◇`). |
| `LatitudeRule` | Pontozott szakaszhatároló, opcionális közép-tag. |
| `ThemeToggle` | Nap ↔ hold átmenet (rotate + opacity). |
| `LanguageToggle` | HU / EN pill-button. |

### 6.3 Ország-komponensek

| Komponens | Cél |
|---|---|
| `CountryCard` | Rács-kártya: zászló (clip 5:3 aspect-tal), lokalizált név, ISO-kód, főváros, lakosság, terület, népsűrűség. + gomb (compare-toggle). |
| `CountryDescription` | Drop-cap-os enciklopédia-szerű mondat: „Magyarország (magyar) egy független ország Európa kontinensén — közelebbről Kelet-Közép-Európa régiójában — fekszik. Fővárosa Budapest." |
| `DataPair` | Címke + érték, közte okker pontozott vezető-vonallal (klasszikus tartalomjegyzék-feeling). |
| `LanguagePills` | Nyelvek listája címke-pillben (ISO-kód kis-kapitálissal + név). |
| `CurrencyList` | Pénznem-szimbólum (Fraunces-szel) + név + ISO-kód. |
| `BorderingCountries` | Szomszédos országok rácsa kis kártyákkal, kattintható linkekkel. |
| `CountryPanel` | A térkép-oldali oldalsó panel. Slide-in motion, fejléc, zászló, gyors-statok, nyelvek, pénznemek, akciógombok. |

### 6.4 Térkép-komponensek

| Komponens | Cél |
|---|---|
| `CountryMap` | Leaflet + OpenStreetMap, az aktuális ország határa GeoJSON-ként kiemelve. Sepia-csempe-szűrő világos témán, invertálás sötét témán. |
| `WorldMap` | SVG világtérkép d3-geo-val (Equal-Earth vetítés). Zoom-pan-kiválasztás, hover-tooltip, graticule (hosszúsági/szélességi rács), opcionális metrika-színezés (lakosság / terület logaritmikus skálával). |

### 6.5 Összehasonlító komponensek

| Komponens | Cél |
|---|---|
| `CompareDrawer` | Sticky alsó drawer az aktuális kiválasztott listával. Kapacitás-számláló, „Lista ürítése", „Megnyitás (N)" CTA. |
| `CompareSlot` | Egy slot a drawerben: zászló-thumb, név, ISO3, ✕ (eltávolítás). |
| `CompareTable` | Az összehasonlító oldal bar-chart-blokkja. Három metrika (lakosság, terület, népsűrűség). |
| `CompareBarChart` | Egy metrika bar-chart-ja: per-ország sor, vízszintes oszlop (relatív magnitúdóval, slot-szín fillel), nyertes-háromszög-jelölővel. |

### 6.6 Oldalak

| Oldal | Felépítés |
|---|---|
| `HomePage` | Hős (Plate I), kereső + szűrő + rendezés, kártya-rács. Loading / error / empty állapotok. |
| `MapPage` | Hős, színezés-toggle, két oszlop: térkép + sticky panel (vagy üres állapot). |
| `CountryDetailPage` | Plate II hős (zászló + ledger), Plate III térkép, Plate IV nyelvek + pénznemek, Plate V szomszédos országok. |
| `ComparePage` | Plate C, oszlop-fejek, latitude-rule, bar-chart-blokk. |
| `NotFoundPage` | „Plate ∞ · Terra Incognita" 404. |

---

## 7. Állapotkezelés

### 7.1 themeStore

```ts
{ theme: 'light' | 'dark', toggle, setTheme }
```

- Kezdeti érték: localStorage-mentett, vagy `prefers-color-scheme` alapján.
- A `applyThemeClass()` szinkron módon felteszi/leveszi a `.dark` osztályt a `<html>`-re.
- **FOUC-prevention**: a modul betöltésekor — még React mount előtt — alkalmaz osztály.

### 7.2 localeStore

```ts
{ locale: 'hu' | 'en', toggle, setLocale }
```

- Kezdeti érték: localStorage, vagy `navigator.language` alapján (HU-fallback).
- Az `<html lang>`-attribútumot is frissíti.

### 7.3 compareStore

```ts
{ items: string[], add, remove, toggle, clear, has, isFull }
```

- `items`: cca3-kódok tömbje, max. 4 (`COMPARE_MAX`).
- `add` visszatérési érték `boolean` — `false`, ha tele, vagy ha már szerepel.

---

## 8. Útvonalak (routing)

Tárolva: [`src/router/routes.tsx`](src/router/routes.tsx). React Router 7 `createBrowserRouter`.

| Útvonal | Komponens | Megjegyzés |
|---|---|---|
| `/` | `HomePage` | Index-oldal |
| `/terkep` | `MapPage` | Világtérkép-oldal; `?o=HUN` paraméter rögzíti a kiválasztott országot |
| `/orszag/:cca3` | `CountryDetailPage` | Részletoldal — pl. `/orszag/HUN` |
| `/osszehasonlitas` | `ComparePage` | Összehasonlítás |
| `*` | `NotFoundPage` | 404 |

A magyar szegmens-nevek tudatos választás: a projekt magyar elsősorban, és a beadáskor jól mutat.

**SPA-fallback**: Netlifyen a [`public/_redirects`](public/_redirects) fájl biztosítja, hogy a `/orszag/HUN`-féle direkt URL-ek ne 404-ezzenek hard-refreshkor (átirányít az `index.html`-re státuszkód 200-zal).

---

## 9. Stílusrendszer — Atlas Sectoria

### 9.1 Vizuális koncepció

A felület úgy olvasható, mint **egy szépen kötött atlasz vagy enciklopédia** — nem mint dashboard vagy tech-demó. National Geographic szerkesztői érzék × svájci tipográfiai precizitás. Az aprólékos részleteken keresztül építi a hangulatot:

- pergamen-szemcse-textúra (~3 % opacity)
- diszkrét kontúrvonalak a részletoldalak hátterében
- „Plate I", „Plate II" római-számos fejezetcímek
- pontozott szakasz-vezetők (`. . . . . .`) a `DataPair`-ben (mint klasszikus tartalomjegyzék)
- iránytű-rózsa a fejlécben
- *Fig. 1 — Magyarország és környezete* feliratok a térképekhez

### 9.2 Színpaletta

Tárolva: [`src/index.css`](src/index.css), `@theme` blokkban.

**Pergamen-kiadás (világos)**

| Token | Hex | Használat |
|---|---|---|
| `--color-paper` | `#F4EDE0` | Fő háttér |
| `--color-paper-deep` | `#ECE0CC` | Második réteg (kártya, drawer) |
| `--color-paper-dim` | `#E1D2B5` | Mélyebb tónus |
| `--color-ink` | `#1A2434` | Fő szöveg, hajszálvonalak |
| `--color-ink-soft` | `#3E4759` | Másodlagos szöveg |
| `--color-ink-faint` | `#6F7585` | Halvány meta-szöveg |
| `--color-ochre` | `#C49B4F` | Index-jelölők, pontvonalak |
| `--color-oxblood` | `#8B2A2C` | Elsődleges kiemelő, kulcs-adatok |
| `--color-atlas` | `#2B4A6A` | Térkép-vízfelület, slot-szín |
| `--color-moss` | `#5C6B43` | Harmadlagos kiemelő |

**Obszervatórium-kiadás (sötét)**

A `.dark` osztályban override-olódnak az ugyanezen tokenek mélyebb / élénkebb értékekre (mély kék-zöld háttér, krém-szöveg, élénk oxblood, ochre, atlas-blue).

### 9.3 Tipográfia

**Self-hosted variable font**-ok (Fontsource):

| Család | Felhasználás | Stilisztikai súly |
|---|---|---|
| **Fraunces Variable** | Címek, ország-nevek | Karakteres talpas, optikai méretezés (`opsz` 9–144) |
| **Inter Tight Variable** | Folyószöveg | Tisztán olvasható, kompaktabb mint a vanilla Inter |
| **JetBrains Mono Variable** | Számok, ISO-kódok, plate-jelölések | „Forenzikus" / „kartográfiai" feeling |

A számokra `font-variant-numeric: tabular-nums` és `feature-settings: "ss01","zero"` van beállítva (`.num` segédosztály vagy `[data-numeral]`).

### 9.4 Dekoratív segédosztályok

```css
.small-caps      kis-kapitális, 0.18em letter-spacing
.dotted-leader   okker pontozott vezető-vonal (DataPair)
.drop-cap        első betű 4.4em-es Fraunces-ben, oxblood
.latitude-rule   szaggatott szakasz-szakasz-szakasz minta
.plate           „◇  PLATE I"-stílusú jelölés
.fade-rise       0.6 s fade-up animáció
.ink-bleed       0.7 s blur-os belép
```

### 9.5 Leaflet-felülírások

A térkép-csempék `filter: sepia(0.55) saturate(0.65) hue-rotate(-10deg) contrast(0.92) brightness(1.04)` kombinációval pergamen-tónusra hangolva. Sötét témán invertálás + sepia + kisebb saturáció + sötétítés. A vezérlőgombok és attribúció is a paletta-token-ekkel vannak újraszínezve.

---

## 10. Lokalizáció (HU / EN)

[`src/i18n/strings.ts`](src/i18n/strings.ts) tartalmazza a teljes stringtáblát. A struktúra hierarchikus, a kulcsok típusos (`as const`), így a TypeScript ellenőrzi a használatot:

```ts
const t = useT()
t.fields.population        // 'Lakosság' vagy 'Population'
t.compare.cta(3)           // 'Megnyitás (3)' vagy 'Open (3)'
t.regions[country.region]  // 'Európa' vagy 'Europe'
```

A számformázók szintén lokalizálódnak ([`src/lib/format.ts`](src/lib/format.ts)):

```ts
formatInt(9957731, 'hu')  // '9 957 731'
formatInt(9957731, 'en')  // '9,957,731'
formatLatLng([47, 19.5], 'hu')  // '47°N · 19,5°E'
formatLatLng([47, 19.5], 'en')  // '47°N · 19.5°E'
```

---

## 11. Telepítés és futtatás

### 11.1 Követelmények

- **Node.js 22+** (a `.nvmrc` kötve van 22-re).
- npm 10+.

### 11.2 Telepítés

```bash
git clone <repo-url>
cd Orszaglexikon_FULLAI
npm install
```

### 11.3 Parancsok

| Parancs | Leírás |
|---|---|
| `npm run dev` | Vite dev-szerver (HMR-rel), `http://localhost:5173` |
| `npm run build` | Type-check (`tsc -b`) + production build (`vite build`) → `dist/` |
| `npm run preview` | A `dist/` előnézete `http://localhost:4173`-on |
| `npm run lint` | ESLint flat config |

---

## 12. Build és deploy

### 12.1 Production build

A `npm run build` **két lépésben**:

1. `tsc -b` — TypeScript projekt-build, hibákat dob a CI-ban, ha a típusok nem stimmelnek.
2. `vite build` — modul-bundling, kódszétszedés, asset-másolás `public/` → `dist/`.

A `dist/` tipikus tartalma:

| Fájl | ~Méret (gz) |
|---|---|
| `index.html` | <1 KB |
| `assets/index-*.js` | 213 KB |
| `assets/countries-50m-*.js` (lazy chunk) | 243 KB |
| `assets/index-*.css` | 18 KB |
| Variable fontok (latin / latin-ext / cyrillic / greek subsets) | ~250 KB összesen |
| `countries.json` | 843 KB (statikus, nem bundle-be) |
| `_redirects` | 24 byte |

A világtérkép TopoJSON-ja **lazy chunk**-ban van: csak akkor töltődik le, ha a felhasználó eljut a `/terkep` vagy `/orszag/:cca3` oldalra.

### 12.2 Netlify-deploy

A projekt Netlifyre van élesítve. Minimális konfiguráció:

| UI-mező | Érték |
|---|---|
| Base directory | _üres_ (a repo gyökere maga a projekt) |
| Build command | `npm run build` |
| Publish directory | `dist` |

A [`public/_redirects`](public/_redirects) (`/* /index.html 200`) biztosítja, hogy a SPA-útvonalak hard-refresh után is működjenek.

A [`.nvmrc`](.nvmrc) Node-verziót pinneli.

---

## 13. Tesztelési ellenőrzőlista

Manuális verifikációs lépések, amelyeket a fejlesztés során és a beadás előtt érdemes végigfuttatni.

- [ ] **Kezdőlap** — a 250 ország rács-kártyán megjelenik.
- [ ] **Keresés** — „Magyarország", „Hungary", „Budapest", „HU", „HUN" mind a magyar kártyához vezetnek.
- [ ] **Régió-szűrő** — csak az adott régió országai jelennek meg; „Mind" visszaállít.
- [ ] **Rendezés** — ábécé / lakosság / terület különböző sorrendet ad (ábécé HU/EN-en eltérő `localeCompare`-rel).
- [ ] **Részletoldal** — kattintásra megfelelő ország-adat jelenik meg, zászló, térkép, szomszédok.
- [ ] **Térkép-kiemelés** — a részletoldali Leaflet-térképen az ország határa oxblood-fillel kiemelve.
- [ ] **Térkép-oldal** — a világtérképen minden ország renderel; hover tooltip mutatja a nevet és lakosságot.
- [ ] **Térkép-zoom** — egér-görgő nagyít a kurzor felé; + / − gombok működnek; reset visszaállít.
- [ ] **Térkép-pan** — drag-elhető; nem lehet túlcsúszni a Föld szélén; pan közben nem zavar a kattintás.
- [ ] **Színezés-toggle** — Egyszerű / Lakosság / Terület módban a térkép-fillek logaritmikus okker-skálán színeződnek; jelmagyarázat megjelenik.
- [ ] **URL-állapot** — `/terkep?o=HUN`-on direkt navigációval Magyarország kiválasztva nyílik.
- [ ] **Összehasonlítás** — 1, 2, 3, 4 ország hozzáadása mindenhonnan (kártya, részletoldal, térkép-panel) működik; drawer alulra kerül.
- [ ] **Compare oldal** — bar-chart-ok megjelennek, a nyertes-háromszög az okkerrel jelölve.
- [ ] **Compare 1 ország** — az oszlopok max. 320 px szélesek; zászló nem fut szét.
- [ ] **Nyelv-váltás** — HU ↔ EN minden felirat, ország-név, szám-formátum, koordináta cserélődik.
- [ ] **Téma-váltás** — világos ↔ sötét paletta; nincs FOUC oldal-frissítéskor.
- [ ] **Perzisztencia** — refresh után megmarad a téma, nyelv és az összehasonlítási lista.
- [ ] **404** — `/nincs-ilyen-oldal` → „Plate ∞ · Terra Incognita".
- [ ] **Reszponzív** — 1440 / 1024 / 375 px-en a layout nem törik el.
- [ ] **Build** — `npm run build` 0 hibával.
- [ ] **Lint** — `npm run lint` 0 hibával.

---

## 14. Lehetséges bővítések

Az alábbiak nem szerepelnek az alap-scope-ban, de jól illeszkednének:

- **Backend + adatbázis** (Express / Hono + PostgreSQL / SQLite vagy Supabase) — felhasználói fiók, kedvencek, mentett összehasonlítások, megjegyzések.
- **Bővített ország-adatok** (GDP, várható élettartam, klíma, stb.) — saját tábla.
- **Történelmi idősorok** — lakosság- vagy GDP-grafikon az évek függvényében (pl. World Bank API).
- **Útvonal-tervező** — két ország közötti távolság / útvonal.
- **Pénznem-konvertáló** — REST Countries-en kívül exchange rate API.
- **Tesztkészlet** — Vitest + React Testing Library (komponens) + Playwright (E2E).
- **Akcessibility-audit** — `axe-core` integráció, fókusz-kezelés, képernyőolvasó-nyilatkozatok.
- **PWA** — service worker, telepíthető app, offline-mode.
- **i18n könyvtárra-váltás** — ha a nyelvszám nőne (`react-i18next`).
- **Kódszétszedés (code-splitting)** — a fő bundle ~213 KB gz; route-szintű lazy import csökkentené az első-betöltési bundle-t.

---

## 15. Függelék

### 15.1 `Country` interface (egyszerűsítve)

```ts
interface Country {
  name: { common: string; official: string; nativeName?: Record<string, NativeName> }
  cca2: string         // 'HU'
  cca3: string         // 'HUN'
  ccn3?: string        // '348' (M49)
  capital?: string[]
  region: string
  subregion?: string
  languages?: Record<string, string>          // { 'hun': 'Hungarian' }
  currencies?: Record<string, Currency>       // { 'HUF': { name, symbol } }
  translations?: Record<string, Translation>  // { 'hun': { common, official } }
  latlng: [number, number]
  area: number
  population: number
  flags: { svg: string; png: string; alt?: string }
  maps?: { googleMaps: string; openStreetMaps: string }
  borders?: string[]                          // szomszédos cca3-ok
  independent?: boolean
  timezones?: string[]
  continents?: string[]
}
```

### 15.2 Glossary

| Fogalom | Magyarázat |
|---|---|
| **cca2 / cca3** | ISO 3166-1 alpha-2 / alpha-3 ország-kód („HU" / „HUN") |
| **ccn3** | ISO 3166-1 numeric / UN M49 kód (Magyarország = 348) |
| **GeoJSON** | JSON-formátum földrajzi adatokhoz (FeatureCollection, Polygon, stb.) |
| **TopoJSON** | A GeoJSON tömör változata, közös élek megosztásával |
| **Equal-Earth** | Területtartó térkép-vetítés, a kerekített Robinson-vetítés mai utódja |
| **graticule** | A földrajzi szélesség- és hosszúsági fokhálózat |
| **FOUC** | „Flash of Unstyled Content" — első renderelés előtti stílustlan villanás |
| **vector-effect: non-scaling-stroke** | SVG-tulajdonság: a vonalvastagság nem skálázódik a viewport-tal |
| **Plate** | Atlasz-szakaszcím; a táblákat római számokkal jelölik (Plate I, II, ...) |

### 15.3 Felhasznált nyilvános források

- **REST Countries v3.1** — <https://restcountries.com>
- **OpenStreetMap** — <https://www.openstreetmap.org>
- **world-atlas** (Mike Bostock) — <https://www.npmjs.com/package/world-atlas>
- **Fraunces** — <https://fonts.google.com/specimen/Fraunces>
- **Inter Tight** — <https://fonts.google.com/specimen/Inter+Tight>
- **JetBrains Mono** — <https://fonts.google.com/specimen/JetBrains+Mono>

---

*Atlas Sectoria · Orszaglexikon · A világ országai egy kötetben.*
