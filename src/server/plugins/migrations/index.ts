import { db } from '#/server/modules/db/drizzle'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

let migrated = false

export async function bootstrap() {
  if (migrated) return

  migrated = true

  console.log('Running migrations...')

  await migrate(db, {
    migrationsFolder: './drizzle',
  })

  console.log('Migrations complete')
}
