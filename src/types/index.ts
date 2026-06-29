import type { LinkProps, RegisteredRouter } from '@tanstack/react-router'
import type { Session, User } from 'better-auth'
import type { icons } from 'lucide-react'

export * from './webrtc_types'

export type AllPaths = LinkProps<RegisteredRouter>['to']
export type IconName = keyof typeof icons
export type SideBarMenuItem = {
  id: string
  name: string
  icon: IconName
  to: AllPaths
}

export type TExtendedUser = User & { permissions: string[] }

export type TCachedSession = {
  session: Session
  user: TExtendedUser
}

export type MenuItem = SideBarMenuItem & { permissions?: string[] }
