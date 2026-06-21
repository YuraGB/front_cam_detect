import { getRequestHeaders } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { authClient } from '../modules/Auth/betterAuthClient/auth-client'
import { logger } from './frontend_logger'
import { getUserById } from '#/server/modules/services/User'
import { safeJsonParse, tryCatch } from './asyncActionHandler'
import type { Session } from 'better-auth'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  getSessionHandler,
)

/**
 *
 * @returns {Session}
 */
async function getSessionHandler() {
  const headers = getRequestHeaders()

  const res = await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie: headers.get('cookie') || '',
      },
    },
  })

  if (res instanceof Response) {
    if (!res.ok) return null
    return await res.json()
  }

  if (!res.data?.session) return null

  return enrichSession(res.data.session)
}

async function enrichSession(
  session: Session & { data?: { user?: { id: string } } },
) {
  if (!session.data?.user) {
    logger.error('The session is required')
    throw new Error('There is no session')
  }

  const userId = session.data.user.id
  if (!userId) return session

  const { data: user, error } = await tryCatch(() => getUserById(userId))

  if (error) {
    logger.error('There is an error in get the user by id', userId)
    throw error
  }

  if (!user) {
    logger.warn('There is no user with such id', userId)
    return session
  }

  return {
    ...session,
    data: {
      ...session.data,
      user: {
        ...session.data.user,
        permissions: safeJsonParse(user.permissionsJson) ?? [],
      },
    },
  }
}
