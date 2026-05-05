import { motion } from 'motion/react'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { formatInt } from '@/lib/format'
import { cn } from '@/lib/cn'

const SLOT_COLORS = [
  'var(--color-oxblood)',
  'var(--color-atlas)',
  'var(--color-ochre)',
  'var(--color-moss)',
] as const

interface BarRowProps {
  name: string
  value: number
  unit: string
  /** 0..1 relative magnitude */
  magnitude: number
  isWinner: boolean
  slotIndex: number
}

function BarRow({ name, value, unit, magnitude, isWinner, slotIndex }: BarRowProps) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const color = SLOT_COLORS[slotIndex % SLOT_COLORS.length]
  return (
    <div className="grid grid-cols-[140px_1fr_auto] items-center gap-3 py-1">
      <div className="font-display text-[14px] truncate">{name}</div>
      <div className="relative h-3 bg-paper-deep border border-ink/15 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, magnitude * 100)}%` }}
          transition={{ duration: 0.7, delay: slotIndex * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
          className="h-full"
          style={{ background: color }}
        />
        {isWinner && (
          <div
            aria-label={t.compare.winner}
            title={t.compare.winner}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '7px solid var(--color-ochre)',
              transform: 'translateY(-50%) rotate(180deg)',
            }}
          />
        )}
      </div>
      <div className={cn('font-mono tabular-nums text-[13px] text-right', isWinner && 'text-oxblood')}>
        {formatInt(value, locale)} <span className="text-ink-soft text-[11px]">{unit}</span>
      </div>
    </div>
  )
}

interface Props {
  title: string
  unit: string
  /** Per-slot data, in slot order. */
  rows: Array<{ name: string; value: number }>
}

export function CompareBarChart({ title, unit, rows }: Props) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div>
      <div className="plate text-ink-soft mb-2.5">{title}</div>
      <div className="space-y-1">
        {rows.map((r, i) => (
          <BarRow
            key={i}
            slotIndex={i}
            name={r.name}
            value={r.value}
            unit={unit}
            magnitude={r.value / max}
            isWinner={r.value === max && rows.length > 1 && r.value > 0}
          />
        ))}
      </div>
    </div>
  )
}
