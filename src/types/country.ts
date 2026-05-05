export interface NativeName {
  official: string
  common: string
}

export interface CountryName {
  common: string
  official: string
  nativeName?: Record<string, NativeName>
}

export interface Currency {
  name: string
  symbol?: string
}

export interface Translation {
  official: string
  common: string
}

export interface Flags {
  png: string
  svg: string
  alt?: string
}

export interface Maps {
  googleMaps: string
  openStreetMaps: string
}

export interface Country {
  name: CountryName
  cca2: string
  cca3: string
  ccn3?: string
  capital?: string[]
  region: string
  subregion?: string
  languages?: Record<string, string>
  currencies?: Record<string, Currency>
  translations?: Record<string, Translation>
  latlng: [number, number]
  area: number
  population: number
  flags: Flags
  maps?: Maps
  borders?: string[]
  independent?: boolean
  timezones?: string[]
  continents?: string[]
}
