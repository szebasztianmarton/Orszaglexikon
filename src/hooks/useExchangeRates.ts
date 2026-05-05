import { useQuery } from '@tanstack/react-query'
import { fetchExchangeRates } from '@/api/exchangeRates'

/**
 * Daily exchange rates for the given base currency. The API itself updates
 * once a day, so a 30-minute stale window is plenty.
 */
export function useExchangeRates(base: string | undefined) {
  const lower = base?.toLowerCase()
  return useQuery({
    queryKey: ['exchange-rates', lower],
    queryFn: ({ signal }) => fetchExchangeRates(lower!, signal),
    enabled: Boolean(lower),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6, // keep in memory 6h
    retry: 1,
  })
}
