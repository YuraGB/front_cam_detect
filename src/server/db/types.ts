import type { account, jwks, session, user, verification } from './schema/auth'

export type TDBUser = typeof user.$inferSelect
export type TDBSession = typeof session.$inferSelect
export type TDBAccount = typeof account.$inferSelect
export type TDBVerification = typeof verification.$inferSelect
export type TDBJwks = typeof jwks.$inferSelect
