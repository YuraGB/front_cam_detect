import { createAuthClient } from 'better-auth/react'
import { customSessionClient, jwtClient } from 'better-auth/client/plugins'
import type { auth } from '#/server/modules/Auth/auth'

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.VITE_API_URL || 'http://localhost:3000'
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [jwtClient(), customSessionClient<typeof auth>()],
})
