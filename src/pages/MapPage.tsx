import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { motion } from 'motion/react'
import { useCountries } from '@/hooks/useCountries'
import { useT } from '@/i18n/useT'
import { PageFrame } from '@/components/layout/PageFrame'
import { LatitudeRule } from '@/components/ui/LatitudeRule'
import { WorldMap, type ColorMode } from '@/components/map/WorldMap'
import { CountryPanel } from '@/components/country/CountryPanel'
import { cn } from '@/lib/cn'

export function MapPage() {
  const { data: countries, isLoading, isError } = useCountries()
  const t = useT()
  const [params, setParams] = useSearchParams()
  const selectedCca3 = params.get('o') // ?o=HUN
  const [colorMode, setColorMode] = useState<ColorMode>('plain')

  const selected =
    selectedCca3 && countries
      ? countries.find((c) => c.cca3 === selectedCca3.toUpperCase()) ?? null
      : null

  const setSelected = (cca3: string | null) => {
    if (cca3) {
      params.set('o', cca3)
    } else {
      params.delete('o')
    }
    setParams(params, { replace: true })
  }

  return (
    <PageFrame withTopo className="pb-24">
      <header className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-8 mt-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
            className="font-display font-medium leading-[0.95] tracking-[-0.02em] text-[clamp(48px,7vw,96px)]"
          >
            {t.map.title}
          </motion.h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-ink-soft max-w-xl">
            {t.map.subtitle}
          </p>
        </div>

        {/* Color mode toggle */}
        <ColorModeToggle value={colorMode} onChange={setColorMode} />
      </header>

      {isLoading ? (
        <div className="py-32 text-center plate text-ink-soft">{t.home.loading}</div>
      ) : isError || !countries ? (
        <div className="py-32 text-center plate text-oxblood">{t.home.error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Map */}
          <div className="border border-ink/25 bg-paper-deep/30 p-3 lg:p-5">
            <WorldMap
              countries={countries}
              selectedCca3={selected?.cca3 ?? null}
              onSelect={setSelected}
              colorMode={colorMode}
            />
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 latitude-rule" />
              <span className="plate text-ink-soft">{t.map.fig}</span>
              <div className="flex-1 latitude-rule" />
            </div>
            <div className="mt-2 flex items-center justify-between text-ink-soft font-mono text-[10px] uppercase tracking-[0.22em]">
              <span>{t.map.countriesShown(countries.length)}</span>
              {selected && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="hover:text-oxblood transition-colors"
                >
                  ✕ {t.actions.close}
                </button>
              )}
            </div>
          </div>

          {/* Panel */}
          <div className="lg:sticky lg:top-6">
            <CountryPanel country={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}

      {colorMode !== 'plain' && (
        <ColorLegend mode={colorMode} className="mt-8" />
      )}

      <LatitudeRule className="mt-12" tag="◇  ◇  ◇" />
    </PageFrame>
  )
}

interface ToggleProps {
  value: ColorMode
  onChange: (m: ColorMode) => void
}

function ColorModeToggle({ value, onChange }: ToggleProps) {
  const t = useT()
  const opts: Array<{ key: ColorMode; label: string }> = [
    { key: 'plain', label: t.map.colorPlain },
    { key: 'population', label: t.map.colorPopulation },
    { key: 'area', label: t.map.colorArea },
  ]
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]">
      <span className="text-ink-soft shrink-0">{t.map.colorBy}</span>
      <div className="inline-flex border border-ink/25">
        {opts.map((o, i) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            aria-pressed={value === o.key}
            className={cn(
              'px-3 py-2 leading-none transition-colors',
              i > 0 && 'border-l border-ink/25',
              value === o.key
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface LegendProps {
  mode: ColorMode
  className?: string
}

function ColorLegend({ mode, className }: LegendProps) {
  const t = useT()
  if (mode === 'plain') return null
  const label = mode === 'population' ? t.fields.population : t.fields.area
  return (
    <div className={cn('inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft', className)}>
      <span>{label}</span>
      <span className="opacity-60">low</span>
      <span
        aria-hidden
        className="inline-block w-40 h-2 border border-ink/25"
        style={{
          background:
            'linear-gradient(to right, var(--color-paper-deep), var(--color-ochre))',
        }}
      />
      <span>high</span>
    </div>
  )
}
