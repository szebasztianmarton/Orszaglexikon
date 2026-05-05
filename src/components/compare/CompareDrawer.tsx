import { Link, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useCountries } from '@/hooks/useCountries'
import { useCompareStore, COMPARE_MAX } from '@/store/compareStore'
import { useT } from '@/i18n/useT'
import { CompareSlot } from './CompareSlot'

export function CompareDrawer() {
  const items = useCompareStore((s) => s.items)
  const clear = useCompareStore((s) => s.clear)
  const { data: countries } = useCountries()
  const t = useT()
  const { pathname } = useLocation()

  // Don't show on the compare page itself
  const onComparePage = pathname.startsWith('/osszehasonlitas')
  const visible = items.length > 0 && !onComparePage

  const list = visible
    ? items
        .map((c) => countries?.find((x) => x.cca3 === c))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
    : []

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[min(1180px,95vw)] w-full"
          role="region"
          aria-label={t.compare.drawerTitle}
        >
          <div className="mx-auto bg-paper border border-ink/40 shadow-[0_18px_40px_-22px_rgba(26,36,52,0.6)] backdrop-blur-md">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-ink/15">
              <span className="plate">{t.compare.drawerTitle}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                {items.length} / {COMPARE_MAX}
              </span>
              <div className="flex-1 latitude-rule" />
              <button
                type="button"
                onClick={clear}
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft hover:text-oxblood transition-colors"
              >
                {t.compare.clear}
              </button>
            </div>

            <div className="flex items-stretch gap-2 px-3 py-3 overflow-x-auto">
              {list.map((country) => (
                <CompareSlot key={country.cca3} country={country} />
              ))}
              {Array.from({ length: COMPARE_MAX - list.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="grid place-items-center min-w-[180px] border border-dashed border-ink/20 text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]"
                >
                  ◇
                </div>
              ))}
              <Link
                to="/osszehasonlitas"
                className="ml-1 inline-flex items-center gap-2 px-5 bg-ink text-paper hover:bg-oxblood transition-colors font-mono text-[11px] uppercase tracking-[0.22em] whitespace-nowrap"
              >
                {t.compare.cta(items.length)}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
