import type { User, GenericEndpointContext } from 'better-auth'
import { getJwtToken } from 'better-auth/plugins'
import { db } from '../db/drizzle'
import { eq } from 'drizzle-orm'
import { logger } from '#/lib/frontend_logger'
import { BETTER_AUTH_URL, SIGNALING_SERVER_URL } from '#/constants'

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

  try {
    const dbUser = await db.query.user.findFirst({
      where: (u) => eq(u.id, user.id),
    })

    /**
     * If the user exists in the database,
     * we send a POST request to the API route to sync the user data. For Signaling server.
     * The Signaling server is independent. It needs to have the user data to manage WebRTC connections and permissions.
     * We include the JWT token in the Authorization header for authentication.
     */
    if (dbUser) {
      // We will not await this fetch request because we don't want to block the user creation process.
      // If the request fails, we will log the error but not throw it, as it should not prevent the user from being created.

      fetch(`${SIGNALING_SERVER_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
          'x-auth-origin': BETTER_AUTH_URL, // as fetch will be withiut origin we will pass an identifire
        },
        body: JSON.stringify({
          ...dbUser,
          permissionsJson: JSON.parse(dbUser.permissionsJson),
        }),
      })
        .then(async (resp) => {
          const r = await resp.text()

          logger.info(r)
        })
        .catch((error) => {
          logger.error(
            'Error sending new user data to API route:',
            (error as Error).message,
            JSON.stringify(dbUser),
          )
        })
    }
  } catch (error) {
    console.error(
      'Error fetching user after creation:',
      (error as Error).message,
    )
  }
}
