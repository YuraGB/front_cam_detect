import { canAccess } from '#/lib/permissonsRoles'
import { useLoaderData } from '@tanstack/react-router'
import { menuItems } from './menuItems.config'
import type { SideBarMenuItem } from '#/types'

export const useUserSidebarMenu = () => {
  const session = useLoaderData({ from: '/(protected)' })
  const userPermissions = session.data.user.permissions
  const visibleItems: SideBarMenuItem[] = menuItems
    .filter((item) => canAccess(userPermissions as string[], item.permissions))
    .map(
      ({ id, icon = 'House', name, to }): SideBarMenuItem => ({
        id: id,
        icon: icon,
        name: name,
        to: to,
      }),
    )

  return visibleItems
}
