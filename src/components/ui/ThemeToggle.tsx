import { useThemeStore } from '@/store/themeStore'
import { useT } from '@/i18n/useT'
import { cn } from '@/lib/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  const t = useT()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.a11y.themeToggle}
      title={t.a11y.themeToggle}
      className={cn(
        'group relative h-9 w-9 grid place-items-center border border-ink/30 hover:border-ink/60 transition-colors',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'opacity-0 -rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100',
        )}
        aria-hidden="true"
      >
        {/* Sun */}
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.5" y1="4.5" x2="6.6" y2="6.6" />
        <line x1="17.4" y1="17.4" x2="19.5" y2="19.5" />
        <line x1="4.5" y1="19.5" x2="6.6" y2="17.4" />
        <line x1="17.4" y1="6.6" x2="19.5" y2="4.5" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75',
        )}
        aria-hidden="true"
      >
        {/* Crescent moon */}
        <path d="M20 14.5A8 8 0 0 1 9.5 4 a8 8 0 1 0 10.5 10.5z" />
        <circle cx="17" cy="6" r="0.6" fill="currentColor" />
        <circle cx="14" cy="3" r="0.4" fill="currentColor" />
      </svg>
    </button>
  )
}
