/**
 * Exchange rates — Fawazahmed currency API via jsDelivr CDN.
 *
 *   https://github.com/fawazahmed0/exchange-api
 *
 * Free, no auth, CORS-friendly, daily-updated, ~300 currencies.
 * Returned shape (lowercase ISO codes):
 *   { date: '2026-05-03', huf: { usd: 0.00322, eur: 0.00275, gbp: 0.00237, ... } }
 */

const BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies'
// Fallback host should the primary CDN have a hiccup.
const FALLBACK = 'https://currency-api.pages.dev/v1/currencies'

export interface ExchangeRates {
  /** ISO date (UTC) of the rate snapshot. */
  date: string
  /** Lowercase ISO code → rate against the base. Always includes the base itself (= 1). */
  rates: Record<string, number>
}

/** Raw API response shape — the base currency's key is dynamic. */
type RawResponse = { date: string } & Record<string, Record<string, number> | string>

async function fetchOnce(host: string, base: string, signal?: AbortSignal): Promise<ExchangeRates> {
  const lower = base.toLowerCase()
  const res = await fetch(`${host}/${lower}.json`, { signal })
  if (!res.ok) throw new Error(`Currency API responded ${res.status}`)
  const json = (await res.json()) as RawResponse
  const rates = json[lower]
  if (!rates || typeof rates !== 'object') {
    throw new Error(`Currency API returned no rates for "${base}"`)
  }
  return { date: json.date, rates: rates as Record<string, number> }
}

export async function fetchExchangeRates(
  base: string,
  signal?: AbortSignal,
): Promise<ExchangeRates> {
  try {
    return await fetchOnce(BASE, base, signal)
  } catch (e) {
    // Try the Cloudflare Pages fallback before propagating
    if (signal?.aborted) throw e
    return fetchOnce(FALLBACK, base, signal)
  }
}
