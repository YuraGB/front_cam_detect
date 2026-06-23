import { getRequestHeaders } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { authClient } from '../modules/Auth/betterAuthClient/auth-client'
import { logger } from './frontend_logger'
import { getUserById } from '#/server/modules/services/User'
import { safeJsonParse, tryCatch } from './asyncActionHandler'
import type { User } from 'better-auth'

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
  logger.info(res.data)
  if (!res.data?.session) return null

  const extendetUser = await enrichUser(res.data.user)
  return {
    data: {
      session: res.data.session,
      user: extendetUser,
    },
  }
}

async function enrichUser(sessionUser?: User) {
  if (!sessionUser) {
    logger.error('The user is required')
    throw new Error('There is no session')
  }

  const userId = sessionUser.id
  if (!userId) return sessionUser

  const { data: user, error } = await tryCatch(() => getUserById(userId))

  if (error) {
    logger.error('There is an error in get the user by id', userId)
    throw error
  }

  if (!user) {
    logger.warn('There is no user with such id', userId)
    return sessionUser
  }

  return {
    ...sessionUser,
    permissions: safeJsonParse(user.permissionsJson) ?? [],
  }
}
