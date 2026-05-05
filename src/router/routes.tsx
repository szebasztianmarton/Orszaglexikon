import type { RouteObject } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { CountryDetailPage } from '@/pages/CountryDetailPage'
import { ComparePage } from '@/pages/ComparePage'
import { MapPage } from '@/pages/MapPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'terkep', element: <MapPage /> },
      { path: 'orszag/:cca3', element: <CountryDetailPage /> },
      { path: 'osszehasonlitas', element: <ComparePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
