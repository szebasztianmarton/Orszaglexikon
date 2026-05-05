import { RouterProvider, createBrowserRouter } from 'react-router'
import { routes } from './router/routes'

const router = createBrowserRouter(routes)

export function App() {
  return <RouterProvider router={router} />
}
