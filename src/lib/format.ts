import type { Locale } from '@/store/localeStore'

const intlLocale = (l: Locale) => (l === 'hu' ? 'hu-HU' : 'en-US')

const numberFormatters = {
  hu: new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
} as const

const decimalFormatters = {
  hu: new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 2, minimumFractionDigits: 0 }),
  en: new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 }),
} as const

export function formatInt(value: number | null | undefined, locale: Locale): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return numberFormatters[locale].format(value)
}

export function formatDecimal(value: number | null | undefined, locale: Locale): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return decimalFormatters[locale].format(value)
}

export function formatLatLng(latlng: [number, number] | undefined, locale: Locale): string {
  if (!latlng || latlng.length !== 2) return '—'
  const [lat, lng] = latlng
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  const f = decimalFormatters[locale]
  return `${f.format(Math.abs(lat))}°${ns} · ${f.format(Math.abs(lng))}°${ew}`
}

export function intlLocaleOf(locale: Locale): string {
  return intlLocale(locale)
}

const compactFormatters = {
  hu: new Intl.NumberFormat('hu-HU', { notation: 'compact', maximumFractionDigits: 1 }),
  en: new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }),
} as const

/** Compact form for axis labels: 9.7M / 9,7 M / 1.5B / 1,5 Mrd. */
export function formatCompact(value: number | null | undefined, locale: Locale): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return compactFormatters[locale].format(value)
}
