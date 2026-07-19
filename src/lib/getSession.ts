import { getRequestHeaders } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '#/server/modules/Auth/auth'
import type { Session } from 'node_modules/better-auth/dist/types/models.d.mts'
import type { TExtendedUser } from '#/types'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  getSessionHandler,
)

/**
 * Retrieves the current user session.
 * @returns {{user: TExtendedUser, session: Session } | null} - Returns the session object if available, otherwise returns null.
 */
async function getSessionHandler(): Promise<{
  user: TExtendedUser
  session: Session
} | null> {
  const headers = getRequestHeaders()

  const session = await auth.api.getSession({
    headers,
  })

  return session ?? null
}
