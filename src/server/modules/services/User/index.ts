import { tryCatch } from '#/lib/asyncActionHandler'
import { logger } from '#/lib/frontend_logger'
import { db } from '#/server/modules/db/drizzle'
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
