import { Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import type { Country } from '@/types/country'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { useCompareStore } from '@/store/compareStore'
import { getDisplayName, getOfficialName, getDensity } from '@/lib/countries'
import { formatInt, formatLatLng } from '@/lib/format'
import { DataPair } from './DataPair'
import { Button } from '@/components/ui/Button'
import { LanguagePills } from './LanguagePills'
import { CurrencyList } from './CurrencyList'
import { cn } from '@/lib/cn'

interface Props {
  country: Country | null
  onClose: () => void
}

export function CountryPanel({ country, onClose }: Props) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const { has, toggle, isFull } = useCompareStore()

  return (
    <AnimatePresence mode="wait">
      {country ? (
        <motion.aside
          key={country.cca3}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
          className="bg-paper-deep/60 border border-ink/30 backdrop-blur-sm flex flex-col"
        >
          <PanelInner
            country={country}
            t={t}
            locale={locale}
            inCompare={has(country.cca3)}
            full={isFull()}
            onToggleCompare={() => toggle(country.cca3)}
            onClose={onClose}
          />
        </motion.aside>
      ) : (
        <motion.aside
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-paper-deep/40 border border-dashed border-ink/25 grid place-items-center text-center px-6 py-16"
        >
          <div>
            <svg
              viewBox="0 0 200 200"
              width="120"
              height="120"
              className="mx-auto opacity-50 text-ink-soft"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              aria-hidden
            >
              <circle cx="100" cy="100" r="86" />
              <circle cx="100" cy="100" r="60" />
              <path d="M14 100 L186 100" />
              <path d="M100 14 L100 186" />
              <path d="M40 40 L160 160" />
              <path d="M40 160 L160 40" />
              <circle cx="100" cy="100" r="3" fill="var(--color-oxblood)" stroke="none" />
            </svg>
            <h2 className="mt-5 font-display italic text-[22px] text-ink">
              {t.map.empty}
            </h2>
            <p className="mt-2 font-sans text-[13px] text-ink-soft max-w-xs mx-auto">
              {t.map.emptyHint}
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

interface InnerProps {
  country: Country
  t: ReturnType<typeof useT>
  locale: ReturnType<typeof useLocaleStore.getState>['locale']
  inCompare: boolean
  full: boolean
  onToggleCompare: () => void
  onClose: () => void
}

function PanelInner({ country, t, locale, inCompare, full, onToggleCompare, onClose }: InnerProps) {
  const name = getDisplayName(country, locale)
  const official = getOfficialName(country, locale)
  const region = t.regions[country.region as keyof typeof t.regions] ?? country.region

  return (
    <>
      <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-ink/15">
        <div className="min-w-0">
          <div className="plate text-ink-soft mb-1">
            {country.cca3} · {country.cca2}
          </div>
          <h2 className="font-display font-medium text-[26px] leading-tight tracking-tight truncate">
            {name}
          </h2>
          <div className="font-display italic text-[13px] text-ink-soft mt-0.5 truncate">
            {official}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.actions.close}
          className="grid place-items-center w-8 h-8 text-ink-soft hover:text-oxblood transition-colors shrink-0"
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>
      </header>

      <div className="px-5 py-4 space-y-5 overflow-y-auto">
        {/* Flag */}
        <div className="relative aspect-[5/3] border border-ink/25 overflow-hidden bg-paper">
          <img
            src={country.flags.svg}
            alt={country.flags.alt || t.a11y.flagOf(name)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-1.5 right-1.5 plate bg-paper/90 px-1.5 py-1 leading-none">
            {country.cca3}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <DataPair compact label={t.fields.capital} value={country.capital?.[0] ?? '—'} />
          <DataPair
            compact
            numeric
            label={t.fields.population}
            value={`${formatInt(country.population, locale)} ${t.units.people}`}
          />
          <DataPair
            compact
            numeric
            label={t.fields.area}
            value={`${formatInt(country.area, locale)} ${t.units.kmSquared}`}
          />
          <DataPair
            compact
            numeric
            label={t.fields.density}
            value={`${formatInt(getDensity(country), locale)} ${t.units.perKmSquared}`}
          />
          <DataPair compact label={t.fields.region} value={region} />
          {country.subregion && (
            <DataPair compact label={t.fields.subregion} value={country.subregion} />
          )}
          <DataPair
            compact
            label={t.detail.coordinates}
            value={<span className="font-mono">{formatLatLng(country.latlng, locale)}</span>}
          />
        </div>

        {/* Languages */}
        <div>
          <div className="plate text-ink-soft mb-2">{t.fields.languages}</div>
          <LanguagePills country={country} />
        </div>

        {/* Currencies */}
        <div>
          <div className="plate text-ink-soft mb-2">{t.fields.currencies}</div>
          <CurrencyList country={country} />
        </div>
      </div>

      <footer className="flex flex-col gap-2 px-5 py-4 border-t border-ink/15 bg-paper/30">
        <Link
          to={`/orszag/${country.cca3}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-ink text-paper hover:bg-oxblood transition-colors font-mono text-[11px] uppercase tracking-[0.22em]"
        >
          {t.actions.open} <span aria-hidden>→</span>
        </Link>
        <Button
          variant={inCompare ? 'solid' : 'outline'}
          onClick={onToggleCompare}
          disabled={!inCompare && full}
          className={cn('w-full', inCompare && 'bg-oxblood border-oxblood hover:bg-oxblood-deep')}
        >
          {inCompare ? `◆ ${t.compare.added}` : `+ ${t.compare.add}`}
        </Button>
      </footer>
    </>
  )
}
