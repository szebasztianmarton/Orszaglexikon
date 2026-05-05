import { useQuery } from '@tanstack/react-query'
import { fetchAllCountries, fetchCountriesGeoJSON } from '@/api/countries'

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: ({ signal }) => fetchAllCountries(signal),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useCountriesGeoJSON() {
  return useQuery({
    queryKey: ['countries-geojson'],
    queryFn: () => fetchCountriesGeoJSON(),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
