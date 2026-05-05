import { Outlet, ScrollRestoration } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { CompareDrawer } from '@/components/compare/CompareDrawer'

export function RootLayout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <CompareDrawer />
      <ScrollRestoration />
    </div>
  )
}
