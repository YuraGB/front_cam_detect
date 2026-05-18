import { getSessionFn } from './getSession'
import { redirect } from '@tanstack/react-router'
import type { ValidateRedirectOptions } from '@tanstack/react-router'

export const authBeforeLoader = async ({
  redirectToIfAuth,
  redirectToIfNotAuth,
}: {
  redirectToIfAuth?: ValidateRedirectOptions
  redirectToIfNotAuth?: ValidateRedirectOptions
}) => {
  // is Authenticated? If so, redirect to profile
  const session = await getSessionFn()
  console.log('session in beforeLoader', session, { redirectToIfAuth, redirectToIfNotAuth })
  if (session.data?.user && redirectToIfAuth) {
    throw redirect(redirectToIfAuth)
  }

  if (!session.data?.user &&redirectToIfNotAuth) {
    throw redirect(redirectToIfNotAuth)
  }
}
