import { useParams, Link } from 'react-router'
import { motion } from 'motion/react'
import { useCountry } from '@/hooks/useCountry'
import { useCompareStore } from '@/store/compareStore'
import { useLocaleStore } from '@/store/localeStore'
import { useT } from '@/i18n/useT'
import {
  getDisplayName,
  getOfficialName,
  getDensity,
} from '@/lib/countries'
import { formatInt, formatLatLng } from '@/lib/format'
import { PageFrame } from '@/components/layout/PageFrame'
import { PlateLabel } from '@/components/ui/PlateLabel'
import { LatitudeRule } from '@/components/ui/LatitudeRule'
import { Button } from '@/components/ui/Button'
import { DataPair } from '@/components/country/DataPair'
import { LanguagePills } from '@/components/country/LanguagePills'
import { CurrencyList } from '@/components/country/CurrencyList'
import { CurrencyConverter } from '@/components/country/CurrencyConverter'
import { BorderingCountries } from '@/components/country/BorderingCountries'
import { CountryDescription } from '@/components/country/CountryDescription'
import { HistoryPlate } from '@/components/country/HistoryPlate'
import { CountryMap } from '@/components/map/CountryMap'
import { NotFoundPage } from './NotFoundPage'
import { cn } from '@/lib/cn'

export function CountryDetailPage() {
  const { cca3 } = useParams<{ cca3: string }>()
  const { country, isLoading, isError } = useCountry(cca3)
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const { has, toggle, isFull } = useCompareStore()

  if (isLoading) {
    return (
      <PageFrame className="py-32 text-center">
        <PlateLabel className="text-ink-soft">{t.home.loading}</PlateLabel>
      </PageFrame>
    )
  }

  if (isError) {
    return (
      <PageFrame className="py-32 text-center">
        <PlateLabel className="text-oxblood">{t.home.error}</PlateLabel>
      </PageFrame>
    )
  }

  if (!country) return <NotFoundPage />

  const name = getDisplayName(country, locale)
  const official = getOfficialName(country, locale)
  const inCompare = has(country.cca3)
  const region = t.regions[country.region as keyof typeof t.regions] ?? country.region

  return (
    <PageFrame withTopo className="pb-12">
      {/* Plate header */}
      <div className="pt-3 pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 plate text-ink-soft hover:text-ink transition-colors"
        >
          <span aria-hidden>←</span> {t.nav.back}
        </Link>
      </div>

      {/* Hero — split flag + ledger */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="space-y-5"
        >
          <h1 className="font-display font-medium leading-[0.92] tracking-[-0.025em] text-[clamp(40px,6vw,84px)]">
            {name}
          </h1>
          <p className="font-display italic text-ink-soft text-[clamp(15px,1.4vw,18px)] leading-snug max-w-[40ch]">
            {official}
          </p>

          <div className="relative aspect-[5/3] border border-ink/25 overflow-hidden bg-paper-deep">
            <img
              src={country.flags.svg}
              alt={country.flags.alt || t.a11y.flagOf(name)}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Subtle vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background:
                'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.18) 100%)',
            }} />
            <div className="absolute bottom-2 right-2 plate bg-paper/85 px-2 py-1 leading-none">
              {country.cca3}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.2, 0.7, 0.2, 1] }}
          className="space-y-7"
        >
          <CountryDescription country={country} />

          <div className="space-y-3 max-w-md">
            <DataPair
              label={t.fields.capital}
              value={country.capital?.[0] ?? '—'}
            />
            <DataPair
              numeric
              label={t.fields.population}
              value={`${formatInt(country.population, locale)} ${t.units.people}`}
            />
            <DataPair
              numeric
              label={t.fields.area}
              value={`${formatInt(country.area, locale)} ${t.units.kmSquared}`}
            />
            <DataPair
              numeric
              label={t.fields.density}
              value={`${formatInt(getDensity(country), locale)} ${t.units.perKmSquared}`}
            />
            <DataPair label={t.fields.region} value={region} />
            {country.subregion && (
              <DataPair label={t.fields.subregion} value={country.subregion} />
            )}
            <DataPair
              label={t.detail.coordinates}
              value={
                <span className="font-mono">
                  {formatLatLng(country.latlng, locale)}
                </span>
              }
            />
          </div>

          <Button
            variant={inCompare ? 'solid' : 'outline'}
            onClick={() => toggle(country.cca3)}
            disabled={!inCompare && isFull()}
            className={cn(inCompare && 'bg-oxblood border-oxblood hover:bg-oxblood-deep')}
          >
            {inCompare ? `◆ ${t.compare.added}` : `+ ${t.compare.add}`}
          </Button>
        </motion.div>
      </section>

      <LatitudeRule className="my-12" />

      {/* Map */}
      <section>
        <CountryMap country={country} />
      </section>

      <LatitudeRule className="my-12" />

      {/* Languages + currencies */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <PlateLabel className="mb-3">{t.fields.languages}</PlateLabel>
          <LanguagePills country={country} />
        </div>
        <div>
          <PlateLabel className="mb-3">{t.fields.currencies}</PlateLabel>
          <CurrencyList country={country} />
        </div>
      </section>

      {/* Currency converter (only when the country has at least one currency) */}
      {country.currencies && Object.keys(country.currencies).length > 0 && (
        <section className="mt-8">
          <CurrencyConverter key={country.cca3} country={country} />
        </section>
      )}

      <LatitudeRule className="my-12" />

      {/* Borders */}
      <section>
        <PlateLabel className="mb-3">{t.fields.borders}</PlateLabel>
        <BorderingCountries country={country} />
      </section>

      <LatitudeRule className="my-12" />

      {/* History — population / GDP time series from World Bank */}
      <section>
        <PlateLabel className="mb-4">{t.history.title}</PlateLabel>
        <HistoryPlate country={country} />
      </section>
    </PageFrame>
  )
}
