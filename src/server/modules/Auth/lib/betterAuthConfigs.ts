import { syncUser } from './syncUser'
import { JWT_AUDIENCE, JWT_ISSUER } from '#/constants/jwt_constants'
import { logger } from '#/lib/frontend_logger'

type SyncUserHook = typeof syncUser

interface DBHooks {
  user: {
    update: {
      after: SyncUserHook
    }
    create: {
      after: SyncUserHook
    }
  }
}

interface JWTConfig {
  jwt: {
    issuer: string
    audience: string
  }
  jwks: {
    rotationInterval: number
    gracePeriod: number
  }
}

interface RateLimiterConfig {
  enabled: boolean
  window: number
  max: number
}

const userAdditionalFields = {
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
} as const

const sessionAdditionalFields = {
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
} as const

const dbHooks: DBHooks = {
  user: {
    update: {
      after: syncUser,
    },
    create: {
      after: syncUser,
    },
  },
} as const

const jwtConfig: JWTConfig = {
  jwt: {
    issuer: JWT_ISSUER, // Require for the validation in Signaling Server
    audience: JWT_AUDIENCE, // Require for the validation in Signaling Server
  },
  jwks: {
    rotationInterval: 60 * 60 * 24 * 30,
    gracePeriod: 60 * 60 * 24 * 30,
  },
} as const

const rateLimiterConfig: RateLimiterConfig = {
  enabled: true,
  window: 60,
  max: 100,
} as const

const loggerConfig = {
  disabled: false,
  disableColors: false,
  level: 'warn',
  log: (level: string, message: string, ...args: unknown[]) => {
    // Custom logging implementation
    logger.info(`[${level}] ${message}`, ...args)
  },
} as const

export {
  userAdditionalFields,
  sessionAdditionalFields,
  dbHooks,
  jwtConfig,
  rateLimiterConfig,
  loggerConfig,
}
