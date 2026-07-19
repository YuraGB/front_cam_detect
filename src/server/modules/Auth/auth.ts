import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { customSession, jwt } from 'better-auth/plugins'
import { db } from '#/server/modules/db/drizzle'
import * as schema from '#/server/modules/db/schema/auth'
import { extendSession } from './lib/extendSession'
import {
  dbHooks,
  jwtConfig,
  loggerConfig,
  rateLimiterConfig,
  sessionAdditionalFields,
  userAdditionalFields,
} from './lib/betterAuthConfigs'

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

  /**
   * Exclude almost all fields,
   * because this user will be using for creating jwt token.
   * We don't want that token has additinal data like roles or permissons for security perpose.
   * But we will add additional fields later in customSession
   */
  user: {
    additionalFields: userAdditionalFields,
  },
  session: {
    additionalFields: sessionAdditionalFields,
  },
  // We need to sync the user data with the signaling server after every user update or creation.
  // This is because the Signaling server is independent and needs to have the user data to manage WebRTC connections and permissions.
  databaseHooks: dbHooks,

  plugins: [
    tanstackStartCookies(),
    jwt(jwtConfig),
    customSession(extendSession),
  ],

  rateLimit: rateLimiterConfig,

  logger: loggerConfig,
})
