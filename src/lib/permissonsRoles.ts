import { createServerFn } from '@tanstack/react-start'
import type { TDBUser } from '../server/db/types'
import { getSessionFn } from './getSession'
import { db } from '#/server/db/drizzle'
import { eq } from 'drizzle-orm'
import { user } from '#/server/db/schema/auth'
import type { Role } from 'node_modules/better-auth/dist/plugins/access/types.d.mts'
import {
  ALL_PERMISSIONS,
  ROLES,
  ROLES_PERMISSIONS,
} from '#/constants/permissions'

export function hasPermission(u: TDBUser, permission: string) {
  const permissions = JSON.parse(u.permissionsJson)

  return permissions.includes(permission)
}

export async function requirePermissions(permissions: string[]) {
  const currentUser = await getCurrentUser()

  const missing = permissions.filter(
    (permission) => !hasPermission(currentUser, permission),
  )

  if (missing.length > 0) {
    throw new Error('Forbidden')
  }

  return currentUser
}

export const getCurrentUser = createServerFn().handler(async () => {
  const session = await getSessionFn()
  const sessionUser = session.data?.user

  if (!sessionUser) {
    throw new Error('Unauthorized')
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, sessionUser.id),
  })

  if (!dbUser) {
    throw new Error('User missing')
  }

  return dbUser
})

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
