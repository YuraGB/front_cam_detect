import { getRequestHeaders } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { getUserByEmail } from '#/server/modules/services/User'
import { safeJsonParse } from './asyncActionHandler'
import { auth } from '#/server/modules/Auth/auth'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  getSessionHandler,
)

export const getPermissionsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { email: string }) => data)
  .handler(getPermissionsHandler)

/**
 *
 * @returns {Session}
 */
async function getSessionHandler() {
  const headers = getRequestHeaders()

  const session = await auth.api.getSession({
    headers,
  })

  return session ?? null
}

async function getPermissionsHandler({
  data,
}: { data?: { email: string } } = {}): Promise<any | null> {
  const email = data?.email
  if (!email) return null

  const user = await getUserByEmail(email)
  if (!user) return null
  return safeJsonParse(user.permissionsJson)
}
