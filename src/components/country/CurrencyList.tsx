import type { Country } from '@/types/country'
import { getCurrencies } from '@/lib/countries'

export function CurrencyList({ country }: { country: Country }) {
  const list = getCurrencies(country)
  if (list.length === 0) return <span className="text-ink-faint">—</span>
  return (
    <ul className="flex flex-wrap gap-3">
      {list.map((c) => (
        <li key={c.code} className="flex items-baseline gap-2">
          <span className="font-display text-[16px] text-oxblood">
            {c.symbol || c.code}
          </span>
          <span className="font-sans text-[14px]">{c.name}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            {c.code}
          </span>
        </li>
      ))}
    </ul>
  )
}
