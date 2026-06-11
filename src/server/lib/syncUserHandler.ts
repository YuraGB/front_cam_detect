import { BETTER_AUTH_URL, SIGNALING_SERVER_URL } from '#/constants'
import { tryCatch } from '#/lib/asyncActionHandler'
import type { TDBUser } from '../db/types'

async function apiSyncUser(token: string, dbUser: TDBUser) {
  return await tryCatch(async () => {
    const response = await fetch(`${SIGNALING_SERVER_URL}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
        'x-auth-origin': BETTER_AUTH_URL,
      },
      body: JSON.stringify({
        ...dbUser,
        permissionsJson: JSON.parse(dbUser.permissionsJson),
      }),
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`)
    }

    return response
  })
}

export { apiSyncUser }
