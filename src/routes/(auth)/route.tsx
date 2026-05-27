import { AuthSidebar } from '#/components/AuthSidebar'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { authBeforeLoader } from '#/lib/authBeforeLoad'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)')({
  component: AuthRouteLayout,
  beforeLoad: () => authBeforeLoader({ redirectToIfNotAuth: { to: '/' } }),
})

function AuthRouteLayout() {
  return (
    <AuthSidebar>
      <article className="page-wrap px-4 pb-8 pt-14">
        <SidebarTrigger className="w-auto p-4 cursor-pointer" />
        <Outlet />
      </article>
    </AuthSidebar>
  )
}