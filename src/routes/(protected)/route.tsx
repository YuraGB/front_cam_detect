import { SidebarTrigger } from '#/components/ui/sidebar'
import { authBeforeLoader } from '#/lib/authBeforeLoad'
import { UserSidebar } from '#/modules/Sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)')({
  component: AuthRouteLayout,
  beforeLoad: async ({ context, location }) => {
    await authBeforeLoader({
      redirectToIfNotAuth: { to: '/' },
      context,
      location,
    })
  },
  loader: ({ context }) => context.queryClient.getQueryData(['session']),
})

function AuthRouteLayout() {
  return (
    <UserSidebar>
      <article className="page-wrap px-4 pb-8 pt-14">
        <SidebarTrigger className="w-auto p-4 cursor-pointer" />
        <Outlet />
      </article>
    </UserSidebar>
  )
}
