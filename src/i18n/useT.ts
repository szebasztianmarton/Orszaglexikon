import { useLocaleStore } from '@/store/localeStore'
import { strings, type Strings } from './strings'

/** Returns the strings object for the current locale. */
export function useT(): Strings {
  const locale = useLocaleStore((s) => s.locale)
  return strings[locale]
}
