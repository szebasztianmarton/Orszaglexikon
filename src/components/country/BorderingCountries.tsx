import { Link } from 'react-router'
import type { Country } from '@/types/country'
import { useCountries } from '@/hooks/useCountries'
import { useLocaleStore } from '@/store/localeStore'
import { useT } from '@/i18n/useT'
import { getDisplayName } from '@/lib/countries'

interface Props {
  country: Country
}

export function BorderingCountries({ country }: Props) {
  const { data } = useCountries()
  const locale = useLocaleStore((s) => s.locale)
  const t = useT()

  if (!country.borders || country.borders.length === 0) {
    return (
      <p className="font-sans italic text-ink-soft">{t.detail.noBorders}</p>
    )
  }

  const neighbors = country.borders
    .map((cca3) => data?.find((c) => c.cca3 === cca3))
    .filter((c): c is Country => Boolean(c))

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {neighbors.map((n) => (
        <li key={n.cca3}>
          <Link
            to={`/orszag/${n.cca3}`}
            className="group block border border-ink/20 hover:border-ink/60 bg-paper-deep/40 hover:bg-paper-deep transition-colors p-2.5"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={n.flags.svg}
                alt={t.a11y.flagOf(getDisplayName(n, locale))}
                className="w-9 h-6 object-cover border border-ink/15 shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <div className="font-display text-[14px] truncate leading-tight">
                  {getDisplayName(n, locale)}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft">
                  {n.cca3}
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
