import { getRequestHeaders } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { authClient } from '../modules/Auth/betterAuthClient/auth-client'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()

    return await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: headers.get('cookie') || '',
        },
      },
    })
  },
)
