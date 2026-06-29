import { createFileRoute, ErrorComponent } from '@tanstack/react-router'
import { Auth } from '#/modules/Auth'
import { authBeforeLoader } from '#/lib/authBeforeLoad'
import { NotFound } from '#/components/NotFound'

export const Route = createFileRoute('/')({
  component: App,
  ssr: true,
  beforeLoad: async ({ context }) =>
    await authBeforeLoader({ redirectToIfAuth: { to: '/profile' }, context }),

  errorComponent: ErrorComponent,
  notFoundComponent: NotFound,
})

function App() {
  return (
    <article className="page-wrap px-4 pb-8 pt-14">
      <Auth />
    </article>
  )
}
