import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { geoEqualEarth, geoPath, type GeoPath } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import type { Country } from '@/types/country'
import { useCountriesGeoJSON } from '@/hooks/useCountries'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { getDisplayName } from '@/lib/countries'
import { formatInt } from '@/lib/format'
import { cn } from '@/lib/cn'

export type ColorMode = 'plain' | 'population' | 'area'

interface Props {
  countries: Country[]
  selectedCca3: string | null
  onSelect: (cca3: string | null) => void
  colorMode?: ColorMode
  className?: string
}

const VIEWBOX_W = 960
const VIEWBOX_H = 500
const MIN_ZOOM = 1
const MAX_ZOOM = 24

interface ViewState {
  zoom: number
  cx: number
  cy: number
}

const INITIAL_VIEW: ViewState = {
  zoom: 1,
  cx: VIEWBOX_W / 2,
  cy: VIEWBOX_H / 2,
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

/** Constrain center so the visible window stays inside the world bounds. */
function clampCenter(cx: number, cy: number, zoom: number): { cx: number; cy: number } {
  const w = VIEWBOX_W / zoom
  const h = VIEWBOX_H / zoom
  return {
    cx: clamp(cx, w / 2, VIEWBOX_W - w / 2),
    cy: clamp(cy, h / 2, VIEWBOX_H - h / 2),
  }
}

function buildCcn3Index(countries: Country[]): Map<string, Country> {
  const m = new Map<string, Country>()
  for (const c of countries) {
    if (c.ccn3) m.set(c.ccn3, c)
  }
  return m
}

function logMag(value: number, max: number): number {
  if (!value || value <= 0 || max <= 0) return 0
  return Math.log10(1 + value) / Math.log10(1 + max)
}

function fillFor(
  country: Country | undefined,
  mode: ColorMode,
  maxPop: number,
  maxArea: number,
  isSelected: boolean,
  isHovered: boolean,
): string {
  if (isSelected) return 'var(--color-oxblood)'
  if (!country) return 'var(--color-paper-dim)'
  if (isHovered) return 'var(--color-ochre)'
  if (mode === 'plain') return 'var(--color-paper-deep)'
  const v = mode === 'population' ? country.population : (country.area || 0)
  const max = mode === 'population' ? maxPop : maxArea
  const mag = logMag(v, max)
  return `color-mix(in oklab, var(--color-ochre) ${Math.round(mag * 75)}%, var(--color-paper-deep))`
}

export function WorldMap({
  countries,
  selectedCca3,
  onSelect,
  colorMode = 'plain',
  className,
}: Props) {
  const { data: geo } = useCountriesGeoJSON()
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  })
  const [view, setView] = useState<ViewState>(INITIAL_VIEW)
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = useRef<{
    startClientX: number
    startClientY: number
    startCx: number
    startCy: number
    moved: boolean
  } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const ccn3Index = useMemo(() => buildCcn3Index(countries), [countries])

  const projection = useMemo(() => {
    return geoEqualEarth().fitSize([VIEWBOX_W, VIEWBOX_H], geo ?? { type: 'Sphere' })
  }, [geo])

  const pathFn: GeoPath = useMemo(() => geoPath(projection), [projection])
  const features = geo?.features ?? []

  const { maxPop, maxArea } = useMemo(() => {
    let mp = 0
    let ma = 0
    for (const c of countries) {
      if (c.population > mp) mp = c.population
      if ((c.area || 0) > ma) ma = c.area || 0
    }
    return { maxPop: mp, maxArea: ma }
  }, [countries])

  const selectedCcn3 = useMemo(() => {
    if (!selectedCca3) return null
    return countries.find((c) => c.cca3 === selectedCca3)?.ccn3 ?? null
  }, [countries, selectedCca3])

  const hoveredCountry = hoveredId ? ccn3Index.get(hoveredId) : undefined

  const viewBox = useMemo(() => {
    const w = VIEWBOX_W / view.zoom
    const h = VIEWBOX_H / view.zoom
    return `${view.cx - w / 2} ${view.cy - h / 2} ${w} ${h}`
  }, [view])

  // Map cursor to SVG-coordinate space at current view
  const cursorToSvg = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const svg = svgRef.current
      if (!svg) return { x: VIEWBOX_W / 2, y: VIEWBOX_H / 2 }
      const rect = svg.getBoundingClientRect()
      const w = VIEWBOX_W / view.zoom
      const h = VIEWBOX_H / view.zoom
      const x = ((clientX - rect.left) / rect.width) * w + (view.cx - w / 2)
      const y = ((clientY - rect.top) / rect.height) * h + (view.cy - h / 2)
      return { x, y }
    },
    [view],
  )

  const zoomBy = useCallback(
    (factor: number, anchor?: { x: number; y: number }) => {
      setView((prev) => {
        const newZoom = clamp(prev.zoom * factor, MIN_ZOOM, MAX_ZOOM)
        if (newZoom === prev.zoom) return prev
        if (!anchor) {
          const c = clampCenter(prev.cx, prev.cy, newZoom)
          return { zoom: newZoom, ...c }
        }
        // Keep `anchor` (in SVG coords) under the same screen position after zoom
        const k = prev.zoom / newZoom
        const newCx = anchor.x - (anchor.x - prev.cx) * k
        const newCy = anchor.y - (anchor.y - prev.cy) * k
        const c = clampCenter(newCx, newCy, newZoom)
        return { zoom: newZoom, ...c }
      })
    },
    [],
  )

  // Wheel handler (manual addEventListener so we can preventDefault)
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.85 : 1 / 0.85
      const anchor = cursorToSvg(e.clientX, e.clientY)
      zoomBy(factor, anchor)
    }
    svg.addEventListener('wheel', handler, { passive: false })
    return () => svg.removeEventListener('wheel', handler)
  }, [cursorToSvg, zoomBy])

  // Drag-to-pan
  const onMouseDownBg = (e: React.MouseEvent<SVGElement>) => {
    if (e.button !== 0) return
    dragStateRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startCx: view.cx,
      startCy: view.cy,
      moved: false,
    }
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return
    const move = (e: MouseEvent) => {
      const ds = dragStateRef.current
      const svg = svgRef.current
      if (!ds || !svg) return
      const rect = svg.getBoundingClientRect()
      const w = VIEWBOX_W / view.zoom
      const h = VIEWBOX_H / view.zoom
      const dx = ((e.clientX - ds.startClientX) / rect.width) * w
      const dy = ((e.clientY - ds.startClientY) / rect.height) * h
      if (Math.abs(e.clientX - ds.startClientX) > 2 || Math.abs(e.clientY - ds.startClientY) > 2) {
        ds.moved = true
      }
      const c = clampCenter(ds.startCx - dx, ds.startCy - dy, view.zoom)
      setView((prev) => ({ ...prev, cx: c.cx, cy: c.cy }))
    }
    const up = () => {
      setIsDragging(false)
      // moved flag is read in onClick below; reset after a tick so click can see it
      setTimeout(() => {
        dragStateRef.current = null
      }, 0)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [isDragging, view.zoom])

  // Track mouse for tooltip positioning
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      setTooltip((p) =>
        p.visible ? { ...p, x: e.clientX - rect.left, y: e.clientY - rect.top } : p,
      )
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const handleCountryClick = (cca3: string) => {
    // suppress click if user just dragged
    if (dragStateRef.current?.moved) return
    onSelect(cca3 === selectedCca3 ? null : cca3)
  }

  if (!geo) {
    return (
      <div className={cn('grid place-items-center h-[500px] border border-ink/15', className)}>
        <span className="plate text-ink-soft">⌛ {t.home.loading}</span>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        role="img"
        aria-label={t.map.title}
        className={cn(
          'block w-full h-auto select-none touch-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onMouseDown={onMouseDownBg}
        onMouseLeave={() => {
          setHoveredId(null)
          setTooltip((p) => ({ ...p, visible: false }))
        }}
      >
        <defs>
          <pattern
            id="map-grain"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-atlas)" strokeWidth="0.3" opacity="0.18" />
          </pattern>
        </defs>

        {/* Sphere background */}
        <path
          d={pathFn({ type: 'Sphere' }) ?? ''}
          fill="var(--color-paper-dim)"
          stroke="var(--color-ink)"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
          opacity="0.35"
        />
        <path d={pathFn({ type: 'Sphere' }) ?? ''} fill="url(#map-grain)" stroke="none" />

        <Graticule pathFn={pathFn} />

        <g>
          {features.map((f) => {
            const id = String(f.id)
            const country = ccn3Index.get(id)
            const isHovered = hoveredId === id
            const isSelected = selectedCcn3 === id
            const d = pathFn(f as Feature<Geometry>)
            if (!d) return null
            return (
              <path
                key={id}
                d={d}
                fill={fillFor(country, colorMode, maxPop, maxArea, isSelected, isHovered)}
                stroke="var(--color-ink)"
                strokeWidth={isSelected ? 1.6 : 0.5}
                strokeOpacity={isSelected ? 1 : 0.55}
                vectorEffect="non-scaling-stroke"
                style={{
                  cursor: country ? (isDragging ? 'grabbing' : 'pointer') : 'inherit',
                  transition: 'fill 160ms ease',
                }}
                onMouseEnter={() => {
                  setHoveredId(id)
                  setTooltip((p) => ({ ...p, visible: !!country }))
                }}
                onMouseLeave={() => {
                  setHoveredId((cur) => (cur === id ? null : cur))
                }}
                onMouseDown={(e) => {
                  // allow drag-pan to start even when starting on a country
                  onMouseDownBg(e)
                }}
                onClick={() => {
                  if (!country) return
                  handleCountryClick(country.cca3)
                }}
              />
            )
          })}
        </g>
      </svg>

      {/* Zoom controls — top-right, atlas-styled */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <ZoomButton
          label={t.map.zoomIn}
          onClick={() => zoomBy(1.4)}
          disabled={view.zoom >= MAX_ZOOM}
        >
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6">
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
        </ZoomButton>
        <ZoomButton
          label={t.map.zoomOut}
          onClick={() => zoomBy(1 / 1.4)}
          disabled={view.zoom <= MIN_ZOOM}
        >
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6">
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
        </ZoomButton>
        <ZoomButton
          label={t.map.zoomReset}
          onClick={() => setView(INITIAL_VIEW)}
          disabled={
            view.zoom === INITIAL_VIEW.zoom &&
            view.cx === INITIAL_VIEW.cx &&
            view.cy === INITIAL_VIEW.cy
          }
        >
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="8" cy="8" r="3" />
            <line x1="8" y1="1" x2="8" y2="3" />
            <line x1="8" y1="13" x2="8" y2="15" />
            <line x1="1" y1="8" x2="3" y2="8" />
            <line x1="13" y1="8" x2="15" y2="8" />
          </svg>
        </ZoomButton>
        <div className="mt-1 px-1 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft">
          {t.map.zoomLevel(view.zoom)}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && hoveredCountry && !isDragging && (
        <div
          className="pointer-events-none absolute z-10 bg-paper border border-ink/40 px-2.5 py-1.5 shadow-[0_8px_24px_-12px_rgba(26,36,52,0.5)]"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12, maxWidth: 220 }}
        >
          <div className="font-display text-[14px] leading-tight">
            {getDisplayName(hoveredCountry, locale)}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft mt-0.5">
            {hoveredCountry.cca3} · {hoveredCountry.region}
          </div>
          <div className="font-mono tabular-nums text-[11px] text-ink-soft mt-1">
            {formatInt(hoveredCountry.population, locale)} {t.map.tooltipPopulation}
          </div>
        </div>
      )}
    </div>
  )
}

interface ZoomButtonProps {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}

function ZoomButton({ children, label, onClick, disabled }: ZoomButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid place-items-center w-8 h-8 bg-paper/90 border border-ink/35 hover:border-ink hover:bg-paper text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-ink/35 backdrop-blur-sm"
    >
      {children}
    </button>
  )
}

function Graticule({ pathFn }: { pathFn: GeoPath }) {
  const lines = useMemo(() => {
    const out: string[] = []
    for (let lon = -180; lon <= 180; lon += 30) {
      const coords: [number, number][] = []
      for (let lat = -85; lat <= 85; lat += 5) coords.push([lon, lat])
      const d = pathFn({ type: 'LineString', coordinates: coords } as never)
      if (d) out.push(d)
    }
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
      stroke="var(--color-ink)"
      strokeWidth="0.3"
      vectorEffect="non-scaling-stroke"
      opacity="0.15"
    >
      {lines.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  )
}
