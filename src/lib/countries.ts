import type { Country } from '@/types/country'
import type { Locale } from '@/store/localeStore'

/** Localized common name. Falls back to English `name.common`. */
export function getDisplayName(country: Country, locale: Locale): string {
  if (locale === 'hu') {
    return country.translations?.hun?.common ?? country.name.common
  }
  return country.name.common
}

/** Localized official name. Falls back to English `name.official`. */
export function getOfficialName(country: Country, locale: Locale): string {
  if (locale === 'hu') {
    return country.translations?.hun?.official ?? country.name.official
  }
  return country.name.official
}

/** Population per km². 0 if area unknown. */
export function getDensity(country: Country): number {
  if (!country.area || country.area === 0) return 0
  return country.population / country.area
}

/** Native name(s) joined ("magyar · français"). Empty string if none. */
export function getNativeNameSummary(country: Country): string {
  const native = country.name.nativeName
  if (!native) return ''
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of Object.values(native)) {
    if (v?.common && !seen.has(v.common)) {
      seen.add(v.common)
      out.push(v.common)
    }
  }
  return out.join(' · ')
}

/** REST Countries returns languages as { eng: 'English', hun: 'Hungarian' }. */
export function getLanguages(country: Country): Array<{ code: string; name: string }> {
  if (!country.languages) return []
  return Object.entries(country.languages).map(([code, name]) => ({ code, name }))
}

export interface CurrencyEntry {
  code: string
  name: string
  symbol: string
}

export function getCurrencies(country: Country): CurrencyEntry[] {
  if (!country.currencies) return []
  return Object.entries(country.currencies).map(([code, c]) => ({
    code,
    name: c.name,
    symbol: c.symbol ?? '',
  }))
}

/** Filter helper: textual match across name/capital/region for search. */
export function matchesQuery(
  country: Country,
  needle: string,
  locale: Locale,
): boolean {
  const q = needle.trim().toLowerCase()
  if (!q) return true
  const candidates = [
    country.name.common,
    country.name.official,
    getDisplayName(country, locale),
    getOfficialName(country, locale),
    country.region,
    country.subregion ?? '',
    country.cca2,
    country.cca3,
    ...(country.capital ?? []),
  ]
  return candidates.some((s) => s.toLowerCase().includes(q))
}

export type SortMode = 'alpha' | 'population' | 'area'

export function sortCountries(
  list: Country[],
  mode: SortMode,
  locale: Locale,
): Country[] {
  const sorted = [...list]
  switch (mode) {
    case 'alpha':
      sorted.sort((a, b) =>
        getDisplayName(a, locale).localeCompare(getDisplayName(b, locale), locale === 'hu' ? 'hu' : 'en'),
      )
      break
    case 'population':
      sorted.sort((a, b) => b.population - a.population)
      break
    case 'area':
      sorted.sort((a, b) => (b.area || 0) - (a.area || 0))
      break
  }
  return sorted
}
