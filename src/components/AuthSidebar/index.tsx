import type { ReactNode } from 'react'
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../ui/sidebar'
import { Link } from '@tanstack/react-router'
import { useListItems } from './useListItems'

export const AuthSidebar = ({ children }: { children: ReactNode }) => {
  const { open, setOpen, menuItems } = useListItems()
  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar>
        <SidebarMenu className="w-64 pt-20">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <Link
                  viewTransition={true}
                  to={item.to}
                  activeProps={{ className: 'nav-link is-active' }}
                >
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </Sidebar>

      {children}
    </SidebarProvider>
  )
}
