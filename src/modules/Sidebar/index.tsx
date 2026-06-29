import { SidebarWrapper } from '#/components/SidebarWrapper'
import type { ReactNode } from 'react'
import { useUserSidebarMenu } from './hook/useUserSidebarMenu'

export const UserSidebar = ({ children }: { children?: ReactNode }) => {
  const { menuItems } = useUserSidebarMenu()

  return <SidebarWrapper menuItems={menuItems}>{children}</SidebarWrapper>
}
