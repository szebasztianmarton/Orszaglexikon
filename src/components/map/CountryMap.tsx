import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Country } from '@/types/country'
import { useCountriesGeoJSON } from '@/hooks/useCountries'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { getDisplayName } from '@/lib/countries'

// Fix default marker icon paths in bundlers (Leaflet's defaults assume webpack assets).
const customIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:var(--color-oxblood);box-shadow:0 0 0 3px color-mix(in oklab, var(--color-oxblood) 20%, transparent);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

interface Props {
  country: Country
}

const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 })
    }
  }, [bounds, map])
  return null
}

export function CountryMap({ country }: Props) {
  const { data: geo } = useCountriesGeoJSON()
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const geoLayerRef = useRef<L.GeoJSON | null>(null)

  const feature = useMemo(() => {
    if (!geo) return null
    // world-atlas TopoJSON identifies countries by M49 numeric code on `feature.id`
    const target = country.ccn3
    if (!target) return null
    return geo.features.find((f) => String(f.id) === target) ?? null
  }, [geo, country.ccn3])

  // Compute bounds from the feature for fitBounds.
  const bounds: L.LatLngBoundsExpression | null = useMemo(() => {
    if (!feature) {
      // Fallback: small box around latlng
      const [lat, lng] = country.latlng
      const d = 4
      return [[lat - d, lng - d], [lat + d, lng + d]]
    }
    try {
      const layer = L.geoJSON(feature as never)
      return layer.getBounds()
    } catch {
      return null
    }
  }, [feature, country.latlng])

  return (
    <div className="relative border border-ink/30">
      <MapContainer
        center={country.latlng}
        zoom={5}
        scrollWheelZoom={false}
        className="h-[480px] w-full"
        key={country.cca3 /* re-mount on country change */}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {feature && (
          <GeoJSON
            ref={(layer) => {
              geoLayerRef.current = layer as L.GeoJSON | null
            }}
            data={feature as never}
            style={{
              color: 'var(--color-oxblood)',
              weight: 2,
              fillColor: 'var(--color-oxblood)',
              fillOpacity: 0.18,
              dashArray: '0',
            }}
          />
        )}

        <Marker position={country.latlng} icon={customIcon}>
          <Popup>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500 }}>
              {getDisplayName(country, locale)}
            </div>
            {country.capital?.[0] && (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, marginTop: 2 }}>
                {t.fields.capital}: {country.capital[0]}
              </div>
            )}
          </Popup>
        </Marker>

        <FitBounds bounds={bounds} />
      </MapContainer>

      {/* Atlas-style figure caption */}
      <figcaption className="px-3 py-2 border-t border-ink/15 bg-paper/80 italic font-display text-[12px] text-ink-soft">
        {t.detail.figMap(getDisplayName(country, locale))}
      </figcaption>
    </div>
  )
}
