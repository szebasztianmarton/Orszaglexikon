/**
 * World Bank Open Data API — public, CORS-friendly, no auth.
 *
 * Indicator catalog: https://data.worldbank.org/indicator
 * API docs:          https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
 */

export type WorldBankIndicator =
  | 'SP.POP.TOTL'      // Population, total
  | 'NY.GDP.MKTP.CD'   // GDP (current US$)
  | 'NY.GDP.PCAP.CD'   // GDP per capita (current US$)

export interface TimeSeriesPoint {
  year: number
  value: number
}

interface WorldBankRow {
  indicator: { id: string; value: string }
  country: { id: string; value: string }
  countryiso3code: string
  date: string
  value: number | null
  unit: string
  obs_status: string
  decimal: number
}

const BASE = 'https://api.worldbank.org/v2/country'

/**
 * Fetch a time series for a single country + indicator. Returns the data
 * already sorted ascending by year and stripped of null values.
 *
 * The World Bank returns `[meta, [rows...]]`. Rows are in descending date
 * order, with `value: null` for years where no observation was made.
 */
export async function fetchWorldBankSeries(
  cca3: string,
  indicator: WorldBankIndicator,
  signal?: AbortSignal,
): Promise<TimeSeriesPoint[]> {
  const url = `${BASE}/${cca3}/indicator/${indicator}?format=json&date=1960:2024&per_page=200`
  const res = await fetch(url, { signal })
  if (!res.ok) {
    throw new Error(`World Bank responded ${res.status}`)
  }
  const json = (await res.json()) as [unknown, WorldBankRow[] | null] | { message: unknown }

  // World Bank returns an object (not an array) when the country/indicator pair is invalid
  if (!Array.isArray(json)) return []
  const rows = json[1]
  if (!rows || !Array.isArray(rows)) return []

  const points: TimeSeriesPoint[] = []
  for (const r of rows) {
    if (r.value === null || r.value === undefined) continue
    const y = Number.parseInt(r.date, 10)
    if (Number.isNaN(y)) continue
    points.push({ year: y, value: r.value })
  }
  points.sort((a, b) => a.year - b.year)
  return points
}
