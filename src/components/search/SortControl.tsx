import { useT } from '@/i18n/useT'
import type { SortMode } from '@/lib/countries'
import { cn } from '@/lib/cn'

interface Props {
  value: SortMode
  onChange: (v: SortMode) => void
  className?: string
}

export function SortControl({ value, onChange, className }: Props) {
  const t = useT()
  const options: Array<{ key: SortMode; label: string }> = [
    { key: 'alpha', label: t.home.sortAlpha },
    { key: 'population', label: t.home.sortPopulation },
    { key: 'area', label: t.home.sortArea },
  ]
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]',
        className,
      )}
      role="group"
      aria-label={t.home.sortLabel}
    >
      <span className="text-ink-soft shrink-0">{t.home.sortLabel}</span>
      <div className="inline-flex border border-ink/25">
        {options.map((o, i) => (
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
