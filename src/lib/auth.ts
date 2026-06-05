import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { jwt } from 'better-auth/plugins'
import { JWT_AUDIENCE, JWT_ISSUER } from '#/constants'
import { db } from '#/server/db/drizzle'
import * as schema from '#/server/db/schema/auth'
import { syncUser } from '#/server/lib/syncUser'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: schema,
  }),

  emailAndPassword: {
    enabled: true,
    recoveryTokenExpiration: 60 * 60 * 24, // 24 hours
    revokeSessionsOnPasswordReset: true,
  },

  // We need to sync the user data with the Signaling server after every update or creation of the user.
  // This is because the Signaling server is independent and needs to have the user data to manage WebRTC connections and permissions.
  databaseHooks: {
    user: {
      update: {
        after: syncUser,
      },
      create: {
        after: syncUser,
      },
    },
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
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  logging: {
    level: 'info',
  },
})
