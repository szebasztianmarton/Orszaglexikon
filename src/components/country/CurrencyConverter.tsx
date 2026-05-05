import { useId, useMemo, useState } from 'react'
import type { Country } from '@/types/country'
import { useExchangeRates } from '@/hooks/useExchangeRates'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { intlLocaleOf } from '@/lib/format'
import { cn } from '@/lib/cn'

interface Props {
  country: Country
  className?: string
}

/**
 * Major world currencies — used as the dropdown options on top of the
 * country's own currency. ISO 4217 codes (uppercase).
 */
const MAJOR_CURRENCIES: readonly string[] = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'CNY',
  'AUD',
  'CAD',
  'HUF',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'RUB',
  'INR',
  'BRL',
  'MXN',
  'ZAR',
  'TRY',
  'KRW',
] as const

/** First ISO currency code on the country, uppercase. Falls back to USD. */
function primaryCurrencyOf(country: Country): string {
  const codes = Object.keys(country.currencies ?? {})
  return (codes[0] ?? 'USD').toUpperCase()
}

/** Build the dropdown option set: country currency + majors, deduped, alphabetical. */
function buildOptions(countryCode: string, allRates?: Record<string, number>): string[] {
  const set = new Set<string>([countryCode, ...MAJOR_CURRENCIES])
  // Filter to currencies the API actually has rates for (when available)
  const out = Array.from(set).filter((code) => {
    if (!allRates) return true
    return allRates[code.toLowerCase()] !== undefined
  })
  out.sort()
  return out
}

/** Round to a sensible number of decimals based on rate magnitude. */
function roundDisplay(value: number): number {
  if (!Number.isFinite(value)) return 0
  const abs = Math.abs(value)
  const digits = abs > 0 && abs < 0.01 ? 6 : abs < 1 ? 4 : 2
  return Number(value.toFixed(digits))
}

export function CurrencyConverter({ country, className }: Props) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const intl = intlLocaleOf(locale)
  const fromIdRoot = useId()

  const primary = useMemo(() => primaryCurrencyOf(country), [country])

  const [from, setFrom] = useState<string>(primary)
  const [to, setTo] = useState<string>(primary === 'USD' ? 'EUR' : 'USD')
  const [fromAmount, setFromAmount] = useState<number>(100)
  // Note: parent provides a `key={country.cca3}` so this component remounts on country change,
  // which resets the from/to state to the new country's primary currency automatically.

  const { data, isLoading, isError } = useExchangeRates(from)
  const rates = data?.rates
  const date = data?.date

  const rate = rates?.[to.toLowerCase()] ?? null
  const toAmount = rate !== null && rate !== undefined ? fromAmount * rate : null

  const options = useMemo(() => buildOptions(primary, rates), [primary, rates])

  const handleSwap = () => {
    setFrom(to)
    setTo(from)
    if (rate && rate > 0) {
      // Keep the displayed "from" amount visually similar by inverting
      const inv = fromAmount * rate
      setFromAmount(roundDisplay(inv))
    }
  }

  const decimalsForLocale = (n: number) => {
    const abs = Math.abs(n)
    if (abs > 0 && abs < 0.01) return 6
    if (abs < 1) return 4
    if (abs < 100) return 2
    return 2
  }

  const formatAmount = (n: number | null) => {
    if (n === null || !Number.isFinite(n)) return ''
    return new Intl.NumberFormat(intl, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimalsForLocale(n),
    }).format(n)
  }

  return (
    <div
      className={cn(
        'border border-ink/25 bg-paper-deep/40 px-4 lg:px-5 py-4 space-y-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="plate text-ink-soft">{t.converter.title}</span>
        {date && (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {t.converter.updated(date)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-3">
        {/* From */}
        <Field
          label={t.converter.from}
          idBase={`${fromIdRoot}-from`}
          amount={fromAmount}
          onAmountChange={(v) => setFromAmount(v)}
          currency={from}
          onCurrencyChange={setFrom}
          options={options}
          locale={intl}
          loading={isLoading}
        />

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          aria-label={t.converter.swap}
          title={t.converter.swap}
          className="self-end mb-[3px] grid place-items-center w-9 h-9 border border-ink/30 hover:border-ink hover:bg-paper text-ink transition-colors"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M7 4 L7 20 M3 8 L7 4 L11 8" />
            <path d="M17 20 L17 4 M13 16 L17 20 L21 16" />
          </svg>
        </button>

        {/* To */}
        <Field
          label={t.converter.to}
          idBase={`${fromIdRoot}-to`}
          amount={toAmount}
          onAmountChange={(v) => {
            if (rate && rate > 0) setFromAmount(v / rate)
          }}
          currency={to}
          onCurrencyChange={setTo}
          options={options}
          locale={intl}
          loading={isLoading}
          readOnlyAmount={false}
        />
      </div>

      {/* Rate line */}
      <div className="font-mono text-[11px] tabular-nums text-ink-soft flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-2 border-t border-ink/15">
        {isLoading ? (
          <span>⌛ {t.converter.loading}</span>
        ) : isError ? (
          <span className="text-oxblood">{t.converter.error}</span>
        ) : rate === null ? (
          <span className="italic">{t.converter.noRate}</span>
        ) : (
          <>
            <span>
              {t.converter.rateLine(
                from,
                to,
                new Intl.NumberFormat(intl, {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 6,
                }).format(rate),
              )}
            </span>
            <span className="text-ink-faint">·</span>
            <span>
              {t.converter.rateLine(
                to,
                from,
                new Intl.NumberFormat(intl, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                }).format(1 / rate),
              )}
            </span>
            <span className="text-ink-faint ml-auto">{t.converter.source}</span>
          </>
        )}
        {/* placeholder to keep layout when rate is loading/null */}
        {(isLoading || isError || rate === null) && (
          <span className="text-ink-faint ml-auto">{t.converter.source}</span>
        )}
      </div>

      {/* Hidden raw amount + readable amount fallback */}
      <span className="sr-only" aria-live="polite">
        {fromAmount} {from} = {formatAmount(toAmount)} {to}
      </span>
    </div>
  )
}

interface FieldProps {
  label: string
  idBase: string
  amount: number | null
  onAmountChange: (v: number) => void
  currency: string
  onCurrencyChange: (code: string) => void
  options: string[]
  locale: string
  loading: boolean
  readOnlyAmount?: boolean
}

function Field({
  label,
  idBase,
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  options,
  loading,
  readOnlyAmount,
}: FieldProps) {
  const inputId = `${idBase}-amount`
  const selectId = `${idBase}-currency`

  // Display value with up to 6 decimals; strip trailing zeros for cleanliness.
  const displayValue = useMemo(() => {
    if (amount === null || !Number.isFinite(amount)) return ''
    const abs = Math.abs(amount)
    const digits = abs > 0 && abs < 0.01 ? 6 : abs < 1 ? 4 : 2
    const fixed = amount.toFixed(digits)
    // Strip insignificant trailing zeros (but keep at least 0)
    return fixed.replace(/\.?0+$/, '') || '0'
  }, [amount])

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block plate text-ink-soft"
      >
        {label}
      </label>
      <div className="flex border border-ink/30 focus-within:border-ink bg-paper transition-colors">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={displayValue}
          readOnly={readOnlyAmount}
          disabled={loading}
          onChange={(e) => {
            const v = Number.parseFloat(e.target.value)
            if (Number.isFinite(v)) onAmountChange(v)
            else if (e.target.value === '') onAmountChange(0)
          }}
          className="flex-1 min-w-0 bg-transparent px-3 py-2.5 font-mono tabular-nums text-[16px] outline-none focus-visible:outline-none"
        />
        <select
          id={selectId}
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          disabled={loading}
          className="bg-paper-deep/60 border-l border-ink/25 px-2 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-ink cursor-pointer focus-visible:outline-none"
        >
          {options.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
