import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'hu' | 'en'

interface LocaleState {
  locale: Locale
  toggle: () => void
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: getInitialLocale(),
      toggle: () => {
        const next: Locale = get().locale === 'hu' ? 'en' : 'hu'
        applyLangAttr(next)
        set({ locale: next })
      },
      setLocale: (locale) => {
        applyLangAttr(locale)
        set({ locale })
      },
    }),
    {
      name: 'orszaglexikon-fullai-locale',
      onRehydrateStorage: () => (state) => {
        if (state) applyLangAttr(state.locale)
      },
    },
  ),
)

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'hu'
  const saved = window.localStorage.getItem('orszaglexikon-fullai-locale')
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as { state?: { locale?: Locale } }
      if (parsed.state?.locale) return parsed.state.locale
    } catch {
      /* invalid storage, ignore */
    }
  }
  // Detect browser language; default to Hungarian since this is a Hungarian project
  const browser = window.navigator.language.toLowerCase()
  if (browser.startsWith('hu')) return 'hu'
  if (browser.startsWith('en')) return 'en'
  return 'hu'
}

function applyLangAttr(locale: Locale) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('lang', locale)
}

if (typeof document !== 'undefined') {
  applyLangAttr(getInitialLocale())
}
