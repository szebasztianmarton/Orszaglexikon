import { useMemo } from 'react'
import { geoEqualEarth, geoPath, type GeoPath } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import { useCountriesGeoJSON } from '@/hooks/useCountries'
import { cn } from '@/lib/cn'

interface Props {
  className?: string
  /** Stroke colour (CSS var or color). Defaults to currentColor. */
  color?: string
  /** Disable all animations (still renders). */
  reduced?: boolean
}

const VIEWBOX_W = 1600
const VIEWBOX_H = 800

/**
 * Decorative living-map background. Renders all country borders as outline-only
 * SVG paths over a faint graticule and sphere outline. Each country path
 * "draws on" once at mount via stroke-dashoffset; the whole map drifts slowly
 * to feel alive. Designed to sit behind hero typography.
 *
 * Reuses the same `world-atlas` TopoJSON we already lazy-load for the
 * detail-page Leaflet highlight and the /terkep page — no extra fetch.
 */
export function WorldOutline({ className, color, reduced = false }: Props) {
  const { data: geo } = useCountriesGeoJSON()

  const projection = useMemo(
    () => geoEqualEarth().fitSize([VIEWBOX_W, VIEWBOX_H], geo ?? { type: 'Sphere' }),
    [geo],
  )
  const pathFn = useMemo(() => geoPath(projection), [projection])
  const features = geo?.features ?? []

  if (!geo) return null

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none world-outline-wrap', className)}
      style={{ color: color ?? 'currentColor' }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        preserveAspectRatio="xMidYMid slice"
        className={cn('w-full h-full', !reduced && 'world-outline-drift')}
        style={{ display: 'block' }}
      >
        {/* Sphere outline — the world's edge */}
        <path
          d={pathFn({ type: 'Sphere' }) ?? ''}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.18"
          vectorEffect="non-scaling-stroke"
        />

        {/* Faint graticule (lat/long grid) */}
        <Graticule pathFn={pathFn} />

        {/* Country borders — animated draw-on via CSS */}
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="0.55"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        >
          {features.map((f, i) => {
            const d = pathFn(f as Feature<Geometry>)
            if (!d) return null
            // Random delay 0.05–1.4s for a non-uniform reveal
            const delay = (((i * 37) % 100) / 100) * 1.35 + 0.05
            return (
              <path
                key={String(f.id) || i}
                d={d}
                pathLength="1"
                className={reduced ? 'world-outline-static' : 'world-outline-path'}
                style={!reduced ? ({ '--draw-delay': `${delay.toFixed(2)}s` } as React.CSSProperties) : undefined}
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}

function Graticule({ pathFn }: { pathFn: GeoPath }) {
  const lines = useMemo(() => {
    const out: string[] = []
    // Meridians every 30°
    for (let lon = -180; lon <= 180; lon += 30) {
      const coords: [number, number][] = []
      for (let lat = -85; lat <= 85; lat += 5) coords.push([lon, lat])
      const d = pathFn({ type: 'LineString', coordinates: coords } as never)
      if (d) out.push(d)
    }
    // Parallels every 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      const coords: [number, number][] = []
      for (let lon = -180; lon <= 180; lon += 5) coords.push([lon, lat])
      const d = pathFn({ type: 'LineString', coordinates: coords } as never)
      if (d) out.push(d)
    }
    return out
  }, [pathFn])

  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="0.3"
      opacity="0.08"
      vectorEffect="non-scaling-stroke"
    >
      {lines.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  )
}
