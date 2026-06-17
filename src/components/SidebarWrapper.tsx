import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '#/components/ui/sidebar'
import type { SideBarMenuItem } from '#/types'
import { LIcon } from './Icons'
import { Link } from '@tanstack/react-router'

export const SidebarWrapper = ({
  children,
  menuItems,
}: {
  children?: ReactNode
  menuItems: SideBarMenuItem[]
}) => {
  const [open, setOpen] = useState(false)
  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className="test">
      <Sidebar>
        <SidebarMenu className="w-64 pt-20">
          {menuItems.map(({ id, to, icon, name }) => (
            <SidebarMenuItem key={id}>
              <SidebarMenuButton asChild>
                <Link
                  viewTransition={false}
                  to={to}
                  activeProps={{ className: 'nav-link is-active' }}
                >
                  <LIcon name={icon} />
                  <span>{name}</span>
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
