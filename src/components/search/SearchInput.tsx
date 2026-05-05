import { useId } from 'react'
import { useT } from '@/i18n/useT'
import { cn } from '@/lib/cn'

interface Props {
  value: string
  onChange: (v: string) => void
  className?: string
}

export function SearchInput({ value, onChange, className }: Props) {
  const id = useId()
  const t = useT()
  return (
    <div className={cn('relative w-full', className)}>
      <label htmlFor={id} className="sr-only">
        {t.home.searchPlaceholder}
      </label>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="11" cy="11" r="6.5" />
          <line x1="16" y1="16" x2="20.5" y2="20.5" />
        </svg>
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.home.searchPlaceholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full bg-paper-deep/40 border border-ink/30 hover:border-ink/60 focus:border-ink focus:bg-paper-deep transition-colors pl-11 pr-4 py-3.5 font-sans text-[15px] outline-none placeholder:text-ink-faint focus-visible:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="clear"
          className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 text-ink-soft hover:text-oxblood transition-colors"
        >
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>
      )}
    </div>
  )
}
