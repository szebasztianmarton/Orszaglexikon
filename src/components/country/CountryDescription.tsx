import type { Country } from '@/types/country'
import { useT } from '@/i18n/useT'
import { useLocaleStore } from '@/store/localeStore'
import { getDisplayName, getNativeNameSummary } from '@/lib/countries'

interface Props {
  country: Country
}

export function CountryDescription({ country }: Props) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const name = getDisplayName(country, locale)
  const native = getNativeNameSummary(country)
  const region = t.regions[country.region as keyof typeof t.regions] ?? country.region

  // Build a compact, encyclopedia-style descriptor.
  // Hungarian: "Magyarország (magyar) Európában, közelebbről Kelet-Közép-Európa régiójában fekvő független ország…"
  const sentenceHU = () => {
    const parts: string[] = []
    parts.push(`${name}`)
    if (native && native !== name) parts.push(`(${native})`)
    parts.push('egy')
    if (country.independent === false) parts.push('függő terület')
    else parts.push('független ország')
    parts.push(`${region} kontinensén`)
    if (country.subregion) parts.push(`— közelebbről ${country.subregion} régiójában —`)
    parts.push('fekszik.')
    if (country.capital?.[0]) parts.push(`Fővárosa ${country.capital[0]}.`)
    return parts.join(' ')
  }

  const sentenceEN = () => {
    const parts: string[] = []
    parts.push(`${name}`)
    if (native && native !== name) parts.push(`(${native})`)
    parts.push('is')
    if (country.independent === false) parts.push('a dependent territory')
    else parts.push('an independent country')
    parts.push(`in ${region}`)
    if (country.subregion) parts.push(`— specifically the ${country.subregion} subregion —`)
    parts.push('.')
    if (country.capital?.[0]) parts.push(`Its capital is ${country.capital[0]}.`)
    return parts.join(' ').replace(' .', '.')
  }

  return (
    <p className="drop-cap font-sans text-[15px] leading-[1.7] text-ink/90 max-w-[58ch]">
      {locale === 'hu' ? sentenceHU() : sentenceEN()}
    </p>
  )
}
