import { useLocaleStore } from '@/store/localeStore'
import { useT } from '@/i18n/useT'
import { cn } from '@/lib/cn'

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const t = useT()

  return (
    <div
      className={cn(
        'inline-flex border border-ink/30 hover:border-ink/60 transition-colors text-[11px] uppercase tracking-[0.22em] font-mono',
        className,
      )}
      role="group"
      aria-label={t.a11y.languageToggle}
    >
      <button
        type="button"
        onClick={() => setLocale('hu')}
        aria-pressed={locale === 'hu'}
        className={cn(
          'px-2.5 py-1.5 leading-none transition-colors',
          locale === 'hu'
            ? 'bg-ink text-paper'
            : 'text-ink-soft hover:text-ink',
        )}
      >
        HU
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={cn(
          'px-2.5 py-1.5 leading-none transition-colors border-l border-ink/30',
          locale === 'en'
            ? 'bg-ink text-paper'
            : 'text-ink-soft hover:text-ink',
        )}
      >
        EN
      </button>
    </div>
  )
}
