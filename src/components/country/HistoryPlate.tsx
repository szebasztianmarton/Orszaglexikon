import { useState } from 'react'
import { motion } from 'motion/react'
import type { Country } from '@/types/country'
import type { WorldBankIndicator } from '@/api/worldBank'
import { useTimeSeries } from '@/hooks/useTimeSeries'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { getDisplayName } from '@/lib/countries'
import { formatCompact, formatInt } from '@/lib/format'
import { TimeSeriesChart } from '@/components/chart/TimeSeriesChart'
import { cn } from '@/lib/cn'

interface Props {
  country: Country
}

type Metric = 'population' | 'gdp' | 'gdpPerCapita'

const METRIC_INDICATOR: Record<Metric, WorldBankIndicator> = {
  population: 'SP.POP.TOTL',
  gdp: 'NY.GDP.MKTP.CD',
  gdpPerCapita: 'NY.GDP.PCAP.CD',
}

const METRIC_COLOR: Record<Metric, string> = {
  population: 'var(--color-oxblood)',
  gdp: 'var(--color-atlas)',
  gdpPerCapita: 'var(--color-moss)',
}

export function HistoryPlate({ country }: Props) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const [metric, setMetric] = useState<Metric>('population')
  const indicator = METRIC_INDICATOR[metric]
  const { data, isLoading, isError } = useTimeSeries(country.cca3, indicator)

  const metricLabel: Record<Metric, string> = {
    population: t.history.metricPopulation,
    gdp: t.history.metricGdp,
    gdpPerCapita: t.history.metricGdpPerCapita,
  }
  const unit: Record<Metric, string> = {
    population: t.history.unitPeople,
    gdp: t.history.unitUSD,
    gdpPerCapita: t.history.unitUSDPerCapita,
  }

  const stats = useStats(data ?? [])
  const range = stats
    ? t.history.yearRange(stats.firstYear, stats.lastYear)
    : ''

  return (
    <div className="space-y-5">
      {/* Header — metric toggle + meta */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 justify-between">
        <MetricToggle value={metric} onChange={setMetric} />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          {t.history.subtitle}
        </span>
      </div>

      {/* Chart */}
      <div className="border border-ink/25 bg-paper-deep/30 px-3 lg:px-5 pt-4 pb-2">
        {isLoading ? (
          <div className="h-[280px] grid place-items-center plate text-ink-soft">
            ⌛ {t.history.loading}
          </div>
        ) : isError ? (
          <div className="h-[280px] grid place-items-center plate text-oxblood">
            {t.history.error}
          </div>
        ) : (
          <motion.div
            key={metric}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <TimeSeriesChart
              data={data ?? []}
              color={METRIC_COLOR[metric]}
              unit={unit[metric]}
            />
          </motion.div>
        )}

        {/* Atlas-style figure caption */}
        {!isLoading && !isError && data && data.length > 0 && (
          <div className="mt-1 px-1 italic font-display text-[12px] text-ink-soft text-center">
            {t.detail.figChart(getDisplayName(country, locale), metricLabel[metric], range)}
          </div>
        )}
      </div>

      {/* Summary statistics */}
      {!isLoading && !isError && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-5">
          <StatBox
            label={t.history.earliest}
            year={stats.firstYear}
            value={formatInt(stats.first, locale)}
            unit={unit[metric]}
            color={METRIC_COLOR[metric]}
          />
          <StatBox
            label={t.history.latest}
            year={stats.lastYear}
            value={formatInt(stats.last, locale)}
            unit={unit[metric]}
            color={METRIC_COLOR[metric]}
            highlight
          />
          <StatBox
            label={t.history.peak}
            year={stats.peakYear}
            value={formatInt(stats.peak, locale)}
            unit={unit[metric]}
            color={METRIC_COLOR[metric]}
          />
        </div>
      )}

      {/* Growth pill */}
      {!isLoading && !isError && stats && (
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 border font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{
              borderColor: stats.growthPct >= 0 ? METRIC_COLOR[metric] : 'var(--color-ink-soft)',
              color: stats.growthPct >= 0 ? METRIC_COLOR[metric] : 'var(--color-ink-soft)',
            }}
          >
            <span aria-hidden>{stats.growthPct >= 0 ? '↗' : '↘'}</span>
            {t.history.growth(stats.growthPct)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            ({formatCompact(stats.first, locale)} → {formatCompact(stats.last, locale)})
          </span>
        </div>
      )}
    </div>
  )
}

interface StatBoxProps {
  label: string
  year: number
  value: string
  unit: string
  color: string
  highlight?: boolean
}

function StatBox({ label, year, value, unit, color, highlight }: StatBoxProps) {
  return (
    <div
      className={cn(
        'border bg-paper-deep/40 px-4 py-3',
        highlight ? 'border-ink/45' : 'border-ink/20',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="plate text-ink-soft">{label}</span>
        <span
          aria-hidden
          className="inline-block w-1.5 h-1.5"
          style={{ background: color }}
        />
      </div>
      <div className="mt-1 font-display text-[22px] leading-tight tabular-nums">
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
        {year} · {unit}
      </div>
    </div>
  )
}

interface ToggleProps {
  value: Metric
  onChange: (m: Metric) => void
}

function MetricToggle({ value, onChange }: ToggleProps) {
  const t = useT()
  const opts: Array<{ key: Metric; label: string }> = [
    { key: 'population', label: t.history.metricPopulation },
    { key: 'gdp', label: t.history.metricGdp },
    { key: 'gdpPerCapita', label: t.history.metricGdpPerCapita },
  ]
  return (
    <div
      className="inline-flex border border-ink/25 font-mono text-[10px] uppercase tracking-[0.22em]"
      role="group"
      aria-label="metric"
    >
      {opts.map((o, i) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={cn(
            'px-3 py-2 leading-none transition-colors',
            i > 0 && 'border-l border-ink/25',
            value === o.key ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

interface Stats {
  first: number
  last: number
  peak: number
  firstYear: number
  lastYear: number
  peakYear: number
  growthPct: number
}

function useStats(data: { year: number; value: number }[]): Stats | null {
  if (data.length === 0) return null
  const first = data[0]
  const last = data[data.length - 1]
  let peak = first
  for (const p of data) if (p.value > peak.value) peak = p
  const growthPct =
    first.value > 0 ? ((last.value - first.value) / first.value) * 100 : 0
  return {
    first: first.value,
    last: last.value,
    peak: peak.value,
    firstYear: first.year,
    lastYear: last.year,
    peakYear: peak.year,
    growthPct,
  }
}
