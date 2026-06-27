import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { AddressForm } from '#/components/AddressForm'
import { UserProfile } from '#/components/UserProfile'

export const Route = createFileRoute('/(protected)/profile/')({
  component: RouteComponent,
  beforeLoad: () => console.log('[profile page]'),
})

function RouteComponent() {
  const session = useLoaderData({ from: '/(protected)' })

  const user = session.data?.user

  return (
    <article className="page-wrap px-4 pb-8 pt-14">
      <UserProfile userName={user?.name || 'User'} />
      <AddressForm user={user} />
    </article>
  )
}
