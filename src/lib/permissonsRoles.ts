import {
  ALL_PERMISSIONS,
  ROLES,
  ROLES_PERMISSIONS,
} from '#/constants/permissions'

import type { Role } from '#/constants/permissions'
import { logger } from '#/lib/frontend_logger'
import type { QueryClient } from '@tanstack/react-query'
import type { TCachedSession, TExtendedUser } from '#/types'

export function hasPermission(u: TExtendedUser, permission: string) {
  const permissions = u.permissions

  if (!Array.isArray(u.permissions)) {
    logger.error('Failed to parse permissionsJson for user:', u.id)
    return false
  }

  return permissions.includes(permission)
}

export function isPermitted(permissions: string[], currentUser: TExtendedUser) {
  const missing = permissions.filter(
    (permission) => !hasPermission(currentUser, permission),
  )

  if (missing.length > 0) {
    return false
  }

  return true
}

export const getCurrentUser = (context: { queryClient: QueryClient }) => {
  const currentSession = context.queryClient.getQueryData<TCachedSession>([
    'session',
  ])
  if (!currentSession) {
    return
  }

  return currentSession.user
}

export function getPermissionsForRole(role: Role) {
  return ROLES_PERMISSIONS[role as unknown as keyof typeof ROLES_PERMISSIONS]
}

export function getAllPermissions() {
  return ALL_PERMISSIONS
}

export function getAllRoles() {
  return Object.keys(ROLES).map((role) => role as unknown as Role)
}

export function getPermissionsForRoles(roles: Role[]) {
  const permissions = new Set<string>()

  roles.forEach((role) => {
    getPermissionsForRole(role).forEach((permission) =>
      permissions.add(permission),
    )
  })

  return Array.from(permissions)
}

export function canAccess(
  userPermissions: string[],
  requiredPermissions?: string[],
) {
  const permSet = new Set(userPermissions)
  if (!requiredPermissions?.length) {
    return true
  }

  return requiredPermissions.every((permission) => permSet.has(permission))
}
