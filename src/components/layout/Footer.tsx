import { useT } from '@/i18n/useT'

export function Footer() {
  const t = useT()
  return (
    <footer className="relative z-10 mt-24 mb-10">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <div className="latitude-rule mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
          <span className="plate">— · {t.footer.year} · —</span>
          <p className="font-sans text-[12px] text-ink-soft leading-relaxed">
            {t.footer.colophon}
          </p>
        </div>
      </div>
    </footer>
  )
}
