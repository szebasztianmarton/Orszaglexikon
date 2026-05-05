import type { Country } from '@/types/country'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { getDisplayName } from '@/lib/countries'
import { CompareBarChart } from './CompareBarChart'

interface Props {
  countries: Country[]
}

export function CompareTable({ countries }: Props) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const names = countries.map((c) => getDisplayName(c, locale))

  const populationRows = countries.map((c, i) => ({ name: names[i], value: c.population }))
  const areaRows = countries.map((c, i) => ({ name: names[i], value: c.area || 0 }))
  const densityRows = countries.map((c, i) => ({
    name: names[i],
    value: c.area ? c.population / c.area : 0,
  }))

  return (
    <div className="space-y-9">
      <CompareBarChart title={t.fields.population} unit={t.units.people} rows={populationRows} />
      <CompareBarChart title={t.fields.area} unit={t.units.kmSquared} rows={areaRows} />
      <CompareBarChart title={t.fields.density} unit={t.units.perKmSquared} rows={densityRows} />
    </div>
  )
}
