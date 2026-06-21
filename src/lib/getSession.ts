import { getRequestHeaders } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { authClient } from '../modules/Auth/betterAuthClient/auth-client'
import { logger } from './frontend_logger'
import { getUserById } from '#/server/modules/services/User'
import { safeJsonParse, tryCatch } from './asyncActionHandler'

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
    const json = await res.json()
    return json
  }

  // Adding additional field to the session
  if (res.data?.user) {
    const { data: currentUser, error } = await tryCatch(() =>
      getUserById(res.data!.user.id),
    )

    if (currentUser) {
      res.data.user = {
        ...res.data.user,
        permissions: safeJsonParse(currentUser.permissionsJson),
      } as typeof res.data.user & {
        permissions: typeof currentUser.permissionsJson
      }
    }

    if (error) {
      if (error instanceof Error) {
        logger.error(error.message)
      } else {
        logger.error(String(error))
      }
    }
  }

  return res
}
