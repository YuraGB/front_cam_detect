import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../schema/auth.ts'

const sqlite = new Database('auth.sqlite')
export const db = drizzle(sqlite, { schema })
