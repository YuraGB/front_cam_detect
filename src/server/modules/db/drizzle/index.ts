import { DATABASE_PATH } from '#/constants/index.ts'
import * as schema from '../schema/auth.ts'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'

console.log('DATABASE_PATH =', DATABASE_PATH)
const sqlite = new Database(DATABASE_PATH)

export const db = drizzle(sqlite, { schema })
