import { redirect } from '@tanstack/react-router'
import { getSessionFn } from './getSession'

export const permissionRoute = async () => {
  const session = await getSessionFn()

  if (!session.data?.user) {
    throw redirect({ to: '/' })
  }

  return session
}
