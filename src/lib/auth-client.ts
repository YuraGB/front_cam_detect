import { createAuthClient } from 'better-auth/react'
import { jwtClient } from 'better-auth/client/plugins'

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.VITE_API_URL || 'http://localhost:3000'
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [jwtClient()],
})
