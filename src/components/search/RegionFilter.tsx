import { useT } from '@/i18n/useT'
import { cn } from '@/lib/cn'

const REGIONS = ['', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'] as const
export type Region = (typeof REGIONS)[number]

interface Props {
  value: Region
  onChange: (v: Region) => void
  className?: string
}

export function RegionFilter({ value, onChange, className }: Props) {
  const t = useT()
  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em]',
        className,
      )}
      role="group"
      aria-label={t.fields.region}
    >
      {REGIONS.map((r) => {
        const label = r === '' ? t.home.regionAll : t.regions[r]
        const active = value === r
        return (
          <button
            key={r || 'all'}
            type="button"
            onClick={() => onChange(r)}
            aria-pressed={active}
            className={cn(
              'px-3 py-2 leading-none border transition-colors',
              active
                ? 'bg-ink text-paper border-ink'
                : 'bg-transparent text-ink-soft border-ink/25 hover:text-ink hover:border-ink/55',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
