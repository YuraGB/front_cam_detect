import { getRequestHeaders } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { authClient } from '../modules/Auth/betterAuthClient/auth-client'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  getSessionHandler,
)

/**
 *
 * @returns {Session}
 */
async function getSessionHandler() {
  const headers = getRequestHeaders()

  const res = await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie: headers.get('cookie') || '',
      },
    },
  })

  if (res instanceof Response) {
    if (!res.ok) return null
    return await res.json()
  }
  if (!res.data?.session) return null

  /**
   *  Root cause: exporting enrichUser from src/lib/getSession.ts made Vite include its server-only   
      imports in the browser bundle. That pulled in:                                                  
                                                                                                 
    - #/server/modules/services/User                                                                
    - Drizzle                                                                                       
    - better-sqlite3                                                                                
                                                                                                 
      Then the browser tried to run better-sqlite3, causing:                                          
                                                                                                 
      ```txt                                                                                          
        TypeError: promisify is not a function                                                        
      ```                                                                                             
                                                                                                 
 Change made:                                                                                    
                                                                                                 
 - Removed exported enrichUser from src/lib/getSession.ts                                        
 - Load server-only enrichUser dynamically inside the server function handler:
   */
  const { enrichUser } = await import('#/server/modules/services/User')
  const extendedUser = await enrichUser(res.data.user)

  return {
    data: {
      session: res.data.session,
      user: extendedUser,
    },
  }
}
