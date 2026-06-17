import { getRequestHeaders } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { authClient } from '../modules/Auth/betterAuthClient/auth-client'
import { logger } from './frontend_logger'
import { getUserById } from '#/server/modules/services/User'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
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
      try {
        const currentUser = await getUserById(res.data.user.id)

        if (currentUser) {
          res.data.user = {
            ...res.data.user,
            permissions: JSON.parse(currentUser.permissionsJson),
          } as typeof res.data.user & {
            permissions: typeof currentUser.permissionsJson
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          logger.error(e.message)
        } else {
          logger.error(String(e))
        }
      }
    }

    return res
  },
)
