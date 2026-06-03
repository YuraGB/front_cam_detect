import { db } from '#/server/db/drizzle'
import { eq } from 'drizzle-orm'

export const getUserById = async (id: string) => {
  try {
    const user = await db.query.user.findFirst({
      where: (u) => eq(u.id, id),
    })
    return user
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw error
  }
}

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.query.user.findFirst({
      where: (u) => eq(u.email, email),
    })
    return user
  } catch (error) {
    console.error('Error fetching user by email:', error)
    throw error
  }
}
