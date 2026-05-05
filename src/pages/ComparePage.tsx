import { Link } from 'react-router'
import { motion } from 'motion/react'
import type { Country } from '@/types/country'
import { useCountries } from '@/hooks/useCountries'
import { useCompareStore } from '@/store/compareStore'
import { useLocaleStore } from '@/store/localeStore'
import { useT } from '@/i18n/useT'
import { getDisplayName } from '@/lib/countries'
import { PageFrame } from '@/components/layout/PageFrame'
import { LatitudeRule } from '@/components/ui/LatitudeRule'
import { Button } from '@/components/ui/Button'
import { CompareTable } from '@/components/compare/CompareTable'

const SLOT_COLORS = [
  'var(--color-oxblood)',
  'var(--color-atlas)',
  'var(--color-ochre)',
  'var(--color-moss)',
]

export function ComparePage() {
  const { data } = useCountries()
  const items = useCompareStore((s) => s.items)
  const remove = useCompareStore((s) => s.remove)
  const clear = useCompareStore((s) => s.clear)
  const locale = useLocaleStore((s) => s.locale)
  const t = useT()

  const countries: Country[] = items
    .map((cca3) => data?.find((c) => c.cca3 === cca3))
    .filter((c): c is Country => Boolean(c))

  return (
    <PageFrame withTopo className="pb-24">
      <div className="pt-3 pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 plate text-ink-soft hover:text-ink transition-colors"
        >
          <span aria-hidden>←</span> {t.nav.back}
        </Link>
      </div>

      <header className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end mb-10">
        <div>
          <h1 className="font-display font-medium leading-[0.95] tracking-[-0.02em] text-[clamp(48px,7vw,104px)]">
            {t.compare.title}
          </h1>
          <p className="font-sans text-[15px] leading-relaxed text-ink-soft mt-3 max-w-xl">
            {t.compare.subtitle}
          </p>
        </div>
        {countries.length > 0 && (
          <Button variant="ghost" onClick={clear}>
            {t.compare.clear}
          </Button>
        )}
      </header>

      {countries.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Slot heads — caps each column at 320px so a single selection doesn't blow up the flag */}
          <div className="-mx-2 px-2 pb-1 overflow-x-auto">
            <section
              className="grid gap-4"
              style={{
                gridTemplateColumns: `140px repeat(${countries.length}, minmax(220px, 320px))`,
              }}
            >
              <div className="plate text-ink-soft self-end pb-2">
                ◇ {t.compare.drawerTitle}
              </div>
            {countries.map((c, i) => (
              <motion.div
                key={c.cca3}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="relative"
              >
                <div
                  className="aspect-[5/3] border border-ink/30 overflow-hidden bg-paper-deep relative"
                  style={{ boxShadow: `inset 0 0 0 3px ${SLOT_COLORS[i]}` }}
                >
                  <img
                    src={c.flags.svg}
                    alt={t.a11y.flagOf(getDisplayName(c, locale))}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span
                    aria-hidden
                    className="inline-block w-2 h-2 shrink-0"
                    style={{ background: SLOT_COLORS[i] }}
                  />
                  <h2 className="font-display text-[18px] leading-tight truncate">
                    {getDisplayName(c, locale)}
                  </h2>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft mt-0.5 flex items-center justify-between">
                  <span>{c.cca3} · {c.region}</span>
                  <button
                    type="button"
                    onClick={() => remove(c.cca3)}
                    className="hover:text-oxblood transition-colors"
                    aria-label={t.compare.remove}
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
            </section>
          </div>

          <LatitudeRule className="my-12" />

          {/* Bar charts */}
          <CompareTable countries={countries} />
        </>
      )}
    </PageFrame>
  )
}

function EmptyState() {
  const t = useT()
  return (
    <div className="py-20 text-center">
      <svg
        viewBox="0 0 200 200"
        width="160"
        height="160"
        className="mx-auto opacity-60 text-ink-soft"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        aria-hidden
      >
        <circle cx="100" cy="100" r="86" />
        <circle cx="100" cy="100" r="60" />
        <circle cx="100" cy="100" r="34" />
        <path d="M14 100 L186 100" />
        <path d="M100 14 L100 186" />
        <text x="100" y="22" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fill="currentColor" stroke="none">N</text>
        <text x="100" y="186" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fill="currentColor" stroke="none">S</text>
        <text x="190" y="103" textAnchor="end" fontFamily="Georgia, serif" fontSize="9" fill="currentColor" stroke="none">E</text>
        <text x="10" y="103" textAnchor="start" fontFamily="Georgia, serif" fontSize="9" fill="currentColor" stroke="none">W</text>
      </svg>
      <h2 className="mt-6 font-display italic text-[28px] text-ink">
        {t.compare.empty}
      </h2>
      <p className="mt-3 font-sans text-[14px] text-ink-soft max-w-md mx-auto">
        {t.compare.emptyHint}
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper hover:bg-oxblood transition-colors font-mono text-[11px] uppercase tracking-[0.22em]"
      >
        {t.notFound.back} <span aria-hidden>→</span>
      </Link>
    </div>
  )
}
