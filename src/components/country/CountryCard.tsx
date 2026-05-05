import { Link } from 'react-router'
import { motion } from 'motion/react'
import type { Country } from '@/types/country'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { useCompareStore } from '@/store/compareStore'
import { getDisplayName, getDensity } from '@/lib/countries'
import { formatInt } from '@/lib/format'
import { DataPair } from './DataPair'
import { cn } from '@/lib/cn'

interface Props {
  country: Country
  index: number
}

export function CountryCard({ country, index }: Props) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const { has, toggle, isFull } = useCompareStore()
  const inCompare = has(country.cca3)
  const full = isFull()
  const name = getDisplayName(country, locale)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(country.cca3)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.018, 0.55),
        ease: [0.2, 0.7, 0.2, 1],
      }}
      className="group relative h-full flex flex-col bg-paper-deep/60 hover:bg-paper-deep border border-ink/15 hover:border-ink/40 transition-colors overflow-hidden"
    >
      {/* Flag */}
      <div className="relative aspect-[5/3] overflow-hidden bg-paper border-b border-ink/10">
        <img
          src={country.flags.svg}
          alt={country.flags.alt || t.a11y.flagOf(name)}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        {/* Index marker */}
        <div className="absolute top-2 left-2 plate bg-paper/90 px-1.5 py-1 leading-none">
          №&nbsp;{(index + 1).toString().padStart(3, '0')}
        </div>
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-ink/10 via-transparent to-transparent" />
      </div>

      {/* Body — flex-col so the button-row sticks to the bottom */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-medium text-[20px] leading-tight tracking-tight">
          {name}
        </h3>
        <div className="mt-0.5 flex items-center gap-2 text-ink-soft">
          <span className="font-sans text-[11px] truncate">
            {country.name.common}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] shrink-0">
            · {country.cca2}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <DataPair
            compact
            label={t.fields.capital}
            value={country.capital?.[0] ?? '—'}
          />
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
        </div>

        {/* Compare button — own row at the bottom of the body */}
        <div className="mt-auto pt-4 flex justify-end">
          <button
            type="button"
            onClick={handleToggle}
            disabled={!inCompare && full}
            aria-label={
              inCompare
                ? t.a11y.removeFromCompare(name)
                : t.a11y.addToCompare(name)
            }
            title={
              inCompare ? t.compare.remove
              : full ? t.compare.max
              : t.compare.add
            }
            className={cn(
              'relative z-10 grid place-items-center w-8 h-8 border transition-colors',
              inCompare
                ? 'bg-oxblood text-paper border-oxblood hover:bg-oxblood-deep'
                : 'bg-paper/90 text-ink border-ink/30 hover:border-ink hover:bg-paper',
              !inCompare && full && 'opacity-40 cursor-not-allowed hover:bg-paper/90 hover:border-ink/30',
            )}
          >
            <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6">
              {inCompare ? (
                <path d="M3 8 L7 12 L13 4" />
              ) : (
                <>
                  <line x1="8" y1="2" x2="8" y2="14" />
                  <line x1="2" y1="8" x2="14" y2="8" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Stretched-link overlay — covers the whole card except where z-10 sits */}
      <Link
        to={`/orszag/${country.cca3}`}
        aria-label={name}
        className="absolute inset-0"
      >
        <span className="sr-only">{name}</span>
      </Link>
    </motion.article>
  )
}
