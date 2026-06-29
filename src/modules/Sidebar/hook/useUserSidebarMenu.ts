import { canAccess } from '#/lib/permissonsRoles'
import { menuItems } from './menuItems.config'
import { authClient } from '#/modules/Auth/betterAuthClient/auth-client'
import { useEffect, useState } from 'react'
import type { SideBarMenuItem } from '#/types'

export const useUserSidebarMenu = () => {
  const { data: session } = authClient.useSession()
  const [links, setLinks] = useState<SideBarMenuItem[]>([])

  useEffect(() => {
    if (session) {
      let userPermissions = session.user.permissions
      userPermissions = Array.isArray(userPermissions) ? userPermissions : []

      const visualLinks = menuItems
        .filter((item) => canAccess(userPermissions, item.permissions))
        .map(({ id, icon = 'House', name, to }) => ({
          id,
          icon,
          name,
          to,
        }))

      setLinks(visualLinks)
    }
  }, [session])

  return { menuItems: links }
}
