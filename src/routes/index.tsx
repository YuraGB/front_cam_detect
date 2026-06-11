import { createFileRoute } from '@tanstack/react-router'
import { Auth } from '#/modules/Auth'
import { authBeforeLoader } from '#/lib/authBeforeLoad'

export const Route = createFileRoute('/')({
  component: App,
  ssr: true,
  beforeLoad: async ({ context }) =>
    await authBeforeLoader({ redirectToIfAuth: { to: '/profile' }, context }),
})

function App() {
  return (
    <article className="page-wrap px-4 pb-8 pt-14">
      <Auth />
    </article>
  )
}
