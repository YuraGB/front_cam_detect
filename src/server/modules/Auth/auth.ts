import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { customSession, jwt } from 'better-auth/plugins'
import { JWT_AUDIENCE, JWT_ISSUER } from '#/constants'
import { db } from '#/server/modules/db/drizzle'
import * as schema from '#/server/modules/db/schema/auth'
import { syncUser } from '#/server/modules/Auth/lib/syncUser'
import { logger } from '#/lib/frontend_logger'
import { createAuthMiddleware } from 'better-auth/api'
import { enrichUser, getUserById } from '../services/User'
import { getQueryContext } from '#/integrations/tanstack-query/query-client'
import { safeJsonParse } from '#/lib/asyncActionHandler'

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
   * But we will add additional fields later in getSessionFn
   */
  user: {
    additionalFields: {
      token: {
        type: 'string',
        returned: false,
      },

      image: {
        type: 'string',
        returned: false,
      },
      createdAt: {
        type: 'string',
        returned: false,
      },
      updatedAt: {
        type: 'string',
        returned: false,
      },
      emailVerified: {
        type: 'string',
        returned: false,
      },
      permissionsJson: {
        type: 'string[]',
        returned: false,
      },
    },
  },
  session: {
    additionalFields: {
      token: {
        type: 'string',
        returned: false,
      },
      permissionsJson: {
        type: 'string[]',
        returned: false,
      },
      createdAt: {
        type: 'string',
        returned: false,
      },
      updatedAt: {
        type: 'string',
        returned: false,
      },
      emailVerified: {
        type: 'string',
        returned: false,
      },
    },
  },
  // We need to sync the user data with the signaling server after every user update or creation.
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
        issuer: JWT_ISSUER, // Require for the validation in Signaling Server
        audience: JWT_AUDIENCE, // Require for the validation in Signaling Server
      },
      jwks: {
        rotationInterval: 60 * 60 * 24 * 30,
        gracePeriod: 60 * 60 * 24 * 30,
      },
    }),
    customSession(async ({ user, session }) => {
      const currentUser = await getUserById(session.userId)

      // todo no current user message
      if (!currentUser) return { session, user: { ...user, permissions: [''] } }
      const userPermissions = safeJsonParse(currentUser.permissionsJson)

      return {
        user: {
          ...user,
          permissions: Array.isArray(userPermissions)
            ? (userPermissions as string[])
            : [''],
        },
        session,
      }
    }),
  ],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-in/email' || ctx.path === '/sign-up/email') {
        const newSession = ctx.context.newSession
        if (!newSession) return

        const extendetUser = await enrichUser(newSession.user)

        const upatedSession = {
          data: {
            session: newSession.session,
            user: extendetUser,
          },
        }

        getQueryContext().queryClient.setQueryData(['session'], upatedSession)
      }
    }),
  },
  logger: {
    disabled: false,
    disableColors: false,
    level: 'warn',
    log: (level, message, ...args) => {
      // Custom logging implementation
      logger.info(`[${level}] ${message}`, ...args)
    },
  },
})
