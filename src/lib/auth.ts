import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { jwt } from 'better-auth/plugins'
import { JWT_AUDIENCE, JWT_ISSUER } from '#/constants'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    tanstackStartCookies(),
    jwt({
      jwt: {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      },
      jwks: {
        rotationInterval: 60 * 60 * 24 * 30,
        gracePeriod: 60 * 60 * 24 * 30,
      },
    }),
  ],
})
