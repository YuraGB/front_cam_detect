import type { Session, User } from 'better-auth'
import { getUserById } from '../../services/User'
import { safeJsonParse } from '#/lib/asyncActionHandler'

type TSesssionArgs = {
  user: User
  session: Session
}
const extendSession = async ({ user, session }: TSesssionArgs) => {
  const currentUser = await getUserById(session.userId)

  if (!currentUser) return { session, user: { ...user, permissions: [] } }
  const userPermissions = safeJsonParse(currentUser.permissionsJson)
  const permissions = Array.isArray(userPermissions)
    ? userPermissions.filter(
        (permission): permission is string => typeof permission === 'string',
      )
    : []

  return {
    session,
    user: {
      ...user,
      permissions,
    },
  }
}

export { extendSession }
