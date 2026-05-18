import {
  createFileRoute,
  redirect,
  useLoaderData,
} from '@tanstack/react-router'
import { AddressForm } from '#/components/AddressForm'
import { getSessionFn } from '#/lib/getSession'
import { useAuthFunctions } from '#/modules/Auth/hooks/useAuthFunctions'
import { UserProfile } from '#/components/UserProfile'

export const Route = createFileRoute('/(auth)/profile/')({
  component: RouteComponent,

  loader: async () => {
    const session = await getSessionFn() // Call the server function to get the session data

    if (!session.data?.user) {
      throw redirect({
        to: '/',
      })
    }

    return session
  },
})

function RouteComponent() {
  const session = useLoaderData({ from: '/(auth)/profile/' })
  const { signOut } = useAuthFunctions()

  const user = session.data?.user

  return (
    <article className="page-wrap px-4 pb-8 pt-14">
      <UserProfile userName={user?.name || 'User'} onSignOut={signOut} />
      <AddressForm user={user} />
    </article>
  )
}
