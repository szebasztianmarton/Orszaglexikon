import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useCountries } from '@/hooks/useCountries'
import { useLocaleStore } from '@/store/localeStore'
import { useT } from '@/i18n/useT'
import { matchesQuery, sortCountries, type SortMode } from '@/lib/countries'
import { PageFrame } from '@/components/layout/PageFrame'
import { LatitudeRule } from '@/components/ui/LatitudeRule'
import { SearchInput } from '@/components/search/SearchInput'
import { RegionFilter, type Region } from '@/components/search/RegionFilter'
import { SortControl } from '@/components/search/SortControl'
import { CountryCard } from '@/components/country/CountryCard'
import { WorldOutline } from '@/components/map/WorldOutline'

export function HomePage() {
  const { data, isLoading, isError } = useCountries()
  const locale = useLocaleStore((s) => s.locale)
  const t = useT()

  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<Region>('')
  const [sort, setSort] = useState<SortMode>('alpha')

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data
    if (region) list = list.filter((c) => c.region === region)
    if (query.trim()) list = list.filter((c) => matchesQuery(c, query, locale))
    return sortCountries(list, sort, locale)
  }, [data, region, query, sort, locale])

  return (
    <PageFrame withTopo className="pt-2 pb-4">
      {/* Hero */}
      <section className="relative isolate pt-12 lg:pt-16 pb-8">
        {/* Living-map outline behind the headline (fades at edges via SVG mask) */}
        <div className="absolute inset-0 -z-10 text-ink">
          <WorldOutline className="w-full h-full" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          className="font-display font-medium leading-[0.92] tracking-[-0.025em] text-[clamp(56px,9vw,128px)]"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t.home.title1}
          <br />
          <span className="italic text-oxblood font-light">{t.home.title2}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
          className="mt-7 max-w-2xl font-sans text-[15px] leading-relaxed text-ink-soft"
        >
          {t.home.subtitle}
        </motion.p>
      </section>

      {/* Search + filters */}
      <section className="mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-end">
          <SearchInput value={query} onChange={setQuery} />
          <SortControl value={sort} onChange={setSort} />
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 items-center">
          <RegionFilter value={region} onChange={setRegion} />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint ml-auto">
            {t.home.results(filtered.length)}
          </span>
        </div>
      </section>

      <LatitudeRule className="my-9" tag="◇  ◇  ◇" />

      {/* Grid */}
      {isLoading ? (
        <div className="py-24 text-center plate text-ink-soft">{t.home.loading}</div>
      ) : isError ? (
        <div className="py-24 text-center plate text-oxblood">{t.home.error}</div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center font-display text-2xl text-ink-soft italic">
          {t.home.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((c, i) => (
            <CountryCard key={c.cca3} country={c} index={i} />
          ))}
        </div>
      )}
    </PageFrame>
  )
}
