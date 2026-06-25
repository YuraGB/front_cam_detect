import { safeJsonParse, tryCatch } from '#/lib/asyncActionHandler'
import { logger } from '#/lib/frontend_logger'
import { db } from '#/server/modules/db/drizzle'
import type { User } from 'better-auth'
import { eq } from 'drizzle-orm'

export const getUserById = async (id: string) => {
  const { data: user, error: errorFondUser } = await tryCatch(() =>
    db.query.user.findFirst({
      where: (u) => eq(u.id, id),
    }),
  )

  if (errorFondUser) {
    logger.error(errorFondUser)
    throw errorFondUser
  }

  return user
}

export const getUserByEmail = async (email: string) => {
  const { data: user, error: errorFondUser } = await tryCatch(() =>
    db.query.user.findFirst({
      where: (u) => eq(u.email, email),
    }),
  )

  if (errorFondUser) {
    logger.error(errorFondUser)
    throw errorFondUser
  }

  return user
}

export async function enrichUser(sessionUser?: User) {
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
