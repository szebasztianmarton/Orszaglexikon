import type { Country } from '@/types/country'
import { getLanguages } from '@/lib/countries'

export function LanguagePills({ country }: { country: Country }) {
  const langs = getLanguages(country)
  if (langs.length === 0) return <span className="text-ink-faint">—</span>
  return (
    <ul className="flex flex-wrap gap-1.5">
      {langs.map((l) => (
        <li
          key={l.code}
          className="inline-flex items-baseline gap-1.5 border border-ink/25 px-2.5 py-1 bg-paper/50"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft">
            {l.code}
          </span>
          <span className="font-sans text-[13px]">{l.name}</span>
        </li>
      ))}
    </ul>
  )
}
