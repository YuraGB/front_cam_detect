import type { User, GenericEndpointContext } from 'better-auth'
import { getJwtToken } from 'better-auth/plugins'
import { db } from '../../db/drizzle'
import { eq } from 'drizzle-orm'
import { logger } from '#/lib/frontend_logger'
import { tryCatch } from '#/lib/asyncActionHandler'
import { apiSyncUser } from './syncUserHandler'

/**
 * The syncUser is the function that send created / updated User
 * to the signaling  server for update cache (Redis) and create / update Shadow User
 * Shadow User is entity that uses for Authenticate and for journaling visitors to the server
 *
 * @param {User} user
 * @param {GenericEndpointContext | null} ctx
 */
export const syncUser = async (
  user: User,
  ctx?: GenericEndpointContext | null,
) => {
  /**
   * For getJwtToken to work,
   * we need to have the session in the context.
   * Since this is a better-auth hook, we can access the new session from the context and set it before calling getJwtToken.
   */
  if (!ctx) {
    throw new Error('Context is required for user synchronization')
  }
  const session = ctx.context.newSession
  if (!session) {
    throw new Error('No session found in context for user synchronization')
  }
  ctx.context.session = session
  const token = await getJwtToken(ctx)
  if (!token) {
    throw new Error('Failed to get JWT token for user synchronization')
  }
  // --------------------------------------------------

  const { data: dbUser, error: errorFindUser } = await tryCatch(() =>
    db.query.user.findFirst({
      where: (u) => eq(u.id, user.id),
    }),
  )

  if (errorFindUser) {
    logger.info('Error find user with user id', user.id)
    return
  }

  if (!dbUser) {
    logger.error('User was not created')
    return
  }

  /**
   * If the user exists in the database,
   * we send a POST request to the API route to sync the user data. For Signaling server.
   * The Signaling server is independent. It needs to have the user data to manage WebRTC connections and permissions.
   * We include the JWT token in the Authorization header for authentication.
   */
  const { data: syncUserStatus, error: errorSyncUser } = await apiSyncUser(
    token,
    dbUser,
  )

  const status = await syncUserStatus?.text()

  if (status === 'ok') logger.info('User was synchronized')

  if (errorSyncUser) {
    logger.error(`The User with id: ${dbUser.id} was not synchronized`)
    // In production ".info" will not be displayed
    logger.info(`Error message: ${errorSyncUser}`)
  }
}
