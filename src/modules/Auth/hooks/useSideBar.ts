import { menuItems } from '#/modules/Sidebar/hook/menuItems.config'
import { useLoaderData } from '@tanstack/react-router'

export const useUserSidebar = () => {
  const session = useLoaderData({ from: '/(protected)' })
  const permSet = new Set(session.data.user.permissions)

  const visibleSidebarLinks = menuItems.filter((item) => {
    // if link don't required any permission link is visible
    if (!item.permissions?.length) return true

    return item.permissions.every((p) => permSet.has(p))
  })

  return visibleSidebarLinks
}
