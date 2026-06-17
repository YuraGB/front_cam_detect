import {
  createFileRoute,
  redirect,
  useLoaderData,
} from '@tanstack/react-router'
import { AddressForm } from '#/components/AddressForm'
import { UserProfile } from '#/components/UserProfile'
import { sessionQueryDataConfiq } from '#/lib/authBeforeLoad'
import { logger } from '#/lib/frontend_logger'

export const Route = createFileRoute('/(protected)/profile/')({
  component: RouteComponent,

  loader: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      sessionQueryDataConfiq,
    )
    if (!session.data?.user) {
      return redirect({
        to: '/',
      })
    }

    return session
  },
})

function RouteComponent() {
  const session = useLoaderData({ from: '/(protected)/profile/' })

  const user = session.data?.user

  return (
    <article className="page-wrap px-4 pb-8 pt-14">
      <UserProfile userName={user?.name || 'User'} />
      <AddressForm user={user} />
    </article>
  )
}
