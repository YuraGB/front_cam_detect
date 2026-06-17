import { PERMISSIONS } from '#/constants/permissions'
import type { MenuItem } from '#/types'

export const menuItems: MenuItem[] = [
  {
    id: 'Dashboard',
    name: 'Dashboard',
    icon: 'House',
    to: '/dashboard',
  },
  {
    id: 'profile',
    name: 'Users',
    icon: 'Users',
    to: '/profile',
  },
  {
    id: 'tests',
    name: 'Tests',
    icon: 'Images',
    to: '/test',
  },
  {
    id: 'streams',
    name: 'Streams',
    to: '/video_stream',
    icon: 'Camera',
    permissions: [PERMISSIONS.STREAM_READ],
  },
  {
    id: 'users',
    name: 'Users',
    to: '/profile',
    icon: 'User',
    permissions: [PERMISSIONS.USERS_WRITE],
  },
]
