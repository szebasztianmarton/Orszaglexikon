import { useMemo } from 'react'
import type { Country } from '@/types/country'
import { useCountries } from './useCountries'

interface UseCountryResult {
  country: Country | undefined
  isLoading: boolean
  isError: boolean
}

/** Read a single country from the cached list — no extra fetch. */
export function useCountry(cca3: string | undefined): UseCountryResult {
  const { data, isLoading, isError } = useCountries()
  const country = useMemo(() => {
    if (!cca3 || !data) return undefined
    const upper = cca3.toUpperCase()
    return data.find((c) => c.cca3 === upper)
  }, [cca3, data])
  return { country, isLoading, isError }
}
