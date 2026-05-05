import { useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { line as d3Line, area as d3Area, curveMonotoneX } from 'd3-shape'
import type { TimeSeriesPoint } from '@/api/worldBank'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { formatCompact, formatInt } from '@/lib/format'
import { cn } from '@/lib/cn'

interface Props {
  data: TimeSeriesPoint[]
  /** Stroke + fill colour. CSS color, e.g. var(--color-oxblood) */
  color?: string
  /** Unit suffix shown in tooltip + summary stats. */
  unit?: string
  className?: string
}

const VBW = 800
const VBH = 280
const PAD = { top: 18, right: 56, bottom: 32, left: 12 }

export function TimeSeriesChart({
  data,
  color = 'var(--color-oxblood)',
  unit = '',
  className,
}: Props) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const chart = useMemo(() => {
    if (data.length === 0) return null

    const xs = data.map((d) => d.year)
    const ys = data.map((d) => d.value)
    const xMin = Math.min(...xs)
    const xMax = Math.max(...xs)
    const yMin = Math.min(...ys)
    const yMax = Math.max(...ys)

    // Pad y-axis so the line never grazes top/bottom
    const yPad = (yMax - yMin) * 0.08 || yMax * 0.08 || 1
    const yLow = Math.max(0, yMin - yPad)
    const yHigh = yMax + yPad

    const x = scaleLinear()
      .domain([xMin, xMax])
      .range([PAD.left, VBW - PAD.right])

    const y = scaleLinear()
      .domain([yLow, yHigh])
      .range([VBH - PAD.bottom, PAD.top])

    const linePath =
      d3Line<TimeSeriesPoint>()
        .x((d) => x(d.year))
        .y((d) => y(d.value))
        .curve(curveMonotoneX)(data) ?? ''

    const areaPath =
      d3Area<TimeSeriesPoint>()
        .x((d) => x(d.year))
        .y0(VBH - PAD.bottom)
        .y1((d) => y(d.value))
        .curve(curveMonotoneX)(data) ?? ''

    // Year ticks: every 10 years, anchored to multiples of 10
    const yearTicks: number[] = []
    const tickStart = Math.ceil(xMin / 10) * 10
    for (let yr = tickStart; yr <= xMax; yr += 10) yearTicks.push(yr)

    // Y ticks: 4 levels between low and high
    const yTickValues: number[] = []
    const yTickCount = 4
    for (let i = 0; i <= yTickCount; i++) {
      yTickValues.push(yLow + ((yHigh - yLow) * i) / yTickCount)
    }

    return { x, y, linePath, areaPath, yearTicks, yTickValues, xMin, xMax }
  }, [data])

  if (!chart || data.length === 0) {
    return (
      <div className={cn('grid place-items-center h-[280px] border border-ink/15 bg-paper-deep/40', className)}>
        <span className="plate text-ink-soft italic">{t.history.noData}</span>
      </div>
    )
  }

  const { x, y, linePath, areaPath, yearTicks, yTickValues } = chart
  const hover = hoverIdx !== null ? data[hoverIdx] : null

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const local = pt.matrixTransform(ctm.inverse())
    const yr = x.invert(local.x)
    // Find nearest data point
    let bestI = 0
    let bestD = Infinity
    for (let i = 0; i < data.length; i++) {
      const d = Math.abs(data[i].year - yr)
      if (d < bestD) {
        bestD = d
        bestI = i
      }
    }
    setHoverIdx(bestI)
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VBW} ${VBH}`}
        className="block w-full h-auto"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
        role="img"
      >
        {/* Y-axis grid lines + tick labels (right side, atlas-style) */}
        <g>
          {yTickValues.map((v, i) => {
            const yy = y(v)
            return (
              <g key={i}>
                <line
                  x1={PAD.left}
                  x2={VBW - PAD.right}
                  y1={yy}
                  y2={yy}
                  stroke="var(--color-ink)"
                  strokeWidth="0.4"
                  strokeOpacity={i === 0 ? 0.45 : 0.12}
                  strokeDasharray={i === 0 ? '0' : '2 3'}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={VBW - PAD.right + 8}
                  y={yy + 3}
                  className="fill-ink-soft"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatCompact(v, locale)}
                </text>
              </g>
            )
          })}
        </g>

        {/* X-axis tick labels (years) */}
        <g>
          {yearTicks.map((yr) => (
            <g key={yr}>
              <line
                x1={x(yr)}
                x2={x(yr)}
                y1={VBH - PAD.bottom}
                y2={VBH - PAD.bottom + 4}
                stroke="var(--color-ink)"
                strokeWidth="0.4"
                strokeOpacity="0.45"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={x(yr)}
                y={VBH - PAD.bottom + 16}
                textAnchor="middle"
                className="fill-ink-soft"
                fontFamily="var(--font-mono)"
                fontSize="10"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {yr}
              </text>
            </g>
          ))}
        </g>

        {/* Area under line */}
        <path d={areaPath} fill={color} fillOpacity="0.08" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="line-draw"
        />

        {/* Hover crosshair */}
        {hover && (
          <g>
            <line
              x1={x(hover.year)}
              x2={x(hover.year)}
              y1={PAD.top}
              y2={VBH - PAD.bottom}
              stroke={color}
              strokeWidth="0.6"
              strokeOpacity="0.55"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={x(hover.year)}
              cy={y(hover.value)}
              r="4"
              fill="var(--color-paper)"
              stroke={color}
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}
      </svg>

      {/* Tooltip — pinned, no positioning math required */}
      {hover && (
        <div
          className="absolute top-2 left-3 bg-paper border border-ink/40 px-3 py-1.5 pointer-events-none shadow-[0_8px_18px_-12px_rgba(26,36,52,0.45)]"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            {hover.year}
          </div>
          <div className="font-display text-[16px] tabular-nums text-ink leading-tight">
            {formatInt(hover.value, locale)}
            {unit && (
              <span className="font-sans text-[11px] text-ink-soft ml-1">{unit}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
