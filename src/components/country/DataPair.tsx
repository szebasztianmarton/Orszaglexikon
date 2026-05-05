import { cn } from '@/lib/cn'

interface Props {
  label: string
  value: React.ReactNode
  /** Render numeric value with mono font + tabular-nums. */
  numeric?: boolean
  /** Smaller variant for cards. */
  compact?: boolean
  className?: string
}

export function DataPair({ label, value, numeric, compact, className }: Props) {
  return (
    <div className={cn('flex items-baseline gap-2 min-w-0', className)}>
      <span
        className={cn(
          'small-caps text-ink-soft shrink-0 font-sans',
          compact ? 'text-[10px]' : 'text-[11px]',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'flex-1 dotted-leader text-ochre h-[6px] translate-y-[-2px] mx-1',
          compact && 'h-[5px]',
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          'shrink-0 truncate text-right',
          numeric ? 'font-mono tabular-nums' : 'font-sans',
          compact ? 'text-[12px]' : 'text-[14px]',
          'text-ink',
        )}
      >
        {value}
      </span>
    </div>
  )
}
