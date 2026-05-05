import { Link, NavLink, useLocation } from 'react-router'
import { Compass } from '@/components/ui/Compass'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useT } from '@/i18n/useT'
import { useCompareStore } from '@/store/compareStore'
import { cn } from '@/lib/cn'

export function Header() {
  const t = useT()
  const compareCount = useCompareStore((s) => s.items.length)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <header className="relative z-10">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-6 lg:pt-8">
        <div className="flex items-center justify-between gap-6">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
            aria-label={`${t.brand.name} — ${t.nav.home}`}
          >
            <Compass size={42} className="text-ink transition-transform duration-700 group-hover:rotate-[20deg]" />
            <div className="flex flex-col leading-none">
              <span className="font-display font-semibold text-[22px] tracking-tight">
                {t.brand.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-soft mt-0.5">
                {t.brand.sub}
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-7 font-mono text-[11px] uppercase tracking-[0.22em]">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'transition-colors hover:text-ink',
                  isActive ? 'text-ink' : 'text-ink-soft',
                )
              }
            >
              {t.nav.home}
            </NavLink>
            <NavLink
              to="/terkep"
              className={({ isActive }) =>
                cn(
                  'transition-colors hover:text-ink',
                  isActive ? 'text-ink' : 'text-ink-soft',
                )
              }
            >
              {t.nav.map}
            </NavLink>
            <NavLink
              to="/osszehasonlitas"
              className={({ isActive }) =>
                cn(
                  'relative transition-colors hover:text-ink',
                  isActive ? 'text-ink' : 'text-ink-soft',
                )
              }
            >
              {t.nav.compare}
              {compareCount > 0 && (
                <span className="absolute -top-1.5 -right-4 inline-grid place-items-center w-4 h-4 rounded-full bg-oxblood text-paper text-[9px] font-mono leading-none">
                  {compareCount}
                </span>
              )}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Latitude beneath header — only on subpages */}
        {!isHome && (
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 latitude-rule" />
            <span className="plate text-ink-soft">— · — · — · — · —</span>
            <div className="flex-1 latitude-rule" />
          </div>
        )}
      </div>
    </header>
  )
}
