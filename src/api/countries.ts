import type { FeatureCollection, Feature, Geometry } from 'geojson'
import type { Topology, GeometryCollection } from 'topojson-specification'
import { feature } from 'topojson-client'
import type { Country } from '@/types/country'

/**
 * Country list — read from a static snapshot bundled in /public.
 *
 * Why a snapshot:
 *  - REST Countries v3.1 (restcountries.com) has no CORS headers and
 *    enforces a 10-field limit on /all, so direct browser fetches fail.
 *  - The snapshot is generated from /independent?status=true|false (which
 *    return full records). Re-generate with the `npm run snapshot` script
 *    if it ever needs refreshing.
 */
const COUNTRIES_URL = '/countries.json'

export async function fetchAllCountries(signal?: AbortSignal): Promise<Country[]> {
  const res = await fetch(COUNTRIES_URL, { signal })
  if (!res.ok) {
    throw new Error(`countries.json responded ${res.status}`)
  }
  const data = (await res.json()) as Country[]
  return data
}

/**
 * Country borders — converted from the bundled `world-atlas` TopoJSON.
 * 50m resolution: ~750 KB (vs. 14 MB for the full GeoJSON dataset).
 *
 * Feature `id` field is the M49 numeric country code (matches `Country.ccn3`).
 */
export type CountriesGeoJSON = FeatureCollection<Geometry, { name: string }>
export type CountryFeature = Feature<Geometry, { name: string }>

let cachedGeo: CountriesGeoJSON | null = null

export async function fetchCountriesGeoJSON(): Promise<CountriesGeoJSON> {
  if (cachedGeo) return cachedGeo

  const mod = await import('world-atlas/countries-50m.json')
  const topology = (mod.default ?? mod) as unknown as Topology
  const collection = topology.objects.countries as GeometryCollection<{ name: string }>
  const fc = feature(topology, collection) as CountriesGeoJSON
  cachedGeo = fc
  return fc
}
