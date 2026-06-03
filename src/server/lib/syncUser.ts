import type { User, AuthContext, GenericEndpointContext } from 'better-auth'
import { getJwtToken } from 'better-auth/plugins'
import { db } from '../db/drizzle'
import { eq } from 'drizzle-orm'
import { env } from '#/env'

export const syncUser = async (
  user: User,
  ctx?: GenericEndpointContext | null,
) => {
  /**
   * For getJwtToken to work,
   * we need to have the session in the context.
   * Since this is a better-auth hook, we can access the new session from the context and set it before calling getJwtToken.
   */
  const session = ctx?.context.newSession
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
      fetch(
        `${env.VITE_BETTER_AUTH_URL || 'http://localhost:3000'}/api/users/sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
          body: JSON.stringify(user),
        },
      ).catch((error) => {
        console.error(
          'Error sending new user data to API route:',
          (error as Error).message,
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
