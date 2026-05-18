import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../ui/sidebar'
import { Home, PictureInPicture, User2, Video } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const AuthSidebar = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar>
        <SidebarMenu className="w-64 pt-20">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                viewTransition={true}
                to="/dashboard"
                activeProps={{ className: 'nav-link is-active' }}
              >
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                viewTransition={true}
                to="/profile"
                activeProps={{ className: 'nav-link is-active' }}
              >
                <User2 />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                viewTransition={true}
                to="/video_stream"
                activeProps={{ className: 'nav-link is-active' }}
              >
                <Video />
                <span>Video Stream</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                viewTransition={true}
                to="/test"
                activeProps={{ className: 'nav-link is-active' }}
              >
                <PictureInPicture />
                <span>Tests</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
      {children}
    </SidebarProvider>
  )
}
