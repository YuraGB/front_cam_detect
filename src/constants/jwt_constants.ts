import { env } from '#/env'

const JWT_ISSUER = env.VITE_JWT_ISSUER || 'better-auth'
const JWT_AUDIENCE = env.VITE_JWT_AUDIENCE || 'signaling'

export { JWT_AUDIENCE, JWT_ISSUER }
