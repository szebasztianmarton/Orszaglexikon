import { useQuery } from '@tanstack/react-query'
import { fetchWorldBankSeries, type WorldBankIndicator } from '@/api/worldBank'

/**
 * Time series for a country + indicator. Cached forever — historical data
 * doesn't change minute-to-minute, and TanStack Query keeps the result for
 * the rest of the session.
 */
export function useTimeSeries(cca3: string | undefined, indicator: WorldBankIndicator) {
  return useQuery({
    queryKey: ['worldbank', cca3, indicator],
    queryFn: ({ signal }) => fetchWorldBankSeries(cca3!, indicator, signal),
    enabled: Boolean(cca3),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  })
}
