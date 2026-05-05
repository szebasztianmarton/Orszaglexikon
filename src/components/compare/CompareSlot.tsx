import { Link } from 'react-router'
import type { Country } from '@/types/country'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { useCompareStore } from '@/store/compareStore'
import { getDisplayName } from '@/lib/countries'

interface Props {
  country: Country
}

export function CompareSlot({ country }: Props) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const remove = useCompareStore((s) => s.remove)
  const name = getDisplayName(country, locale)

  return (
    <div className="group relative flex items-center gap-3 border border-ink/25 bg-paper-deep/60 backdrop-blur-sm pl-2.5 pr-3 py-2 min-w-[180px]">
      <img
        src={country.flags.svg}
        alt={t.a11y.flagOf(name)}
        className="w-9 h-6 object-cover border border-ink/20 shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="font-display text-[13px] truncate leading-tight">
          {name}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft">
          {country.cca3}
        </div>
      </div>
      <button
        type="button"
        onClick={() => remove(country.cca3)}
        aria-label={t.a11y.removeFromCompare(name)}
        title={t.compare.remove}
        className="grid place-items-center w-6 h-6 text-ink-soft hover:text-oxblood transition-colors"
      >
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.4">
          <line x1="3" y1="3" x2="13" y2="13" />
          <line x1="13" y1="3" x2="3" y2="13" />
        </svg>
      </button>
      <Link
        to={`/orszag/${country.cca3}`}
        className="absolute inset-0"
        aria-label={`${name} — ${t.actions.open}`}
        tabIndex={-1}
      >
        <span className="sr-only">{name}</span>
      </Link>
    </div>
  )
}
