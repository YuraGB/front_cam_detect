import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { getSessionFn } from './getSession'
import { redirect } from '@tanstack/react-router'
import type { ValidateRedirectOptions } from '@tanstack/react-router'

const sessionQueryDataConfiq = queryOptions({
  queryKey: ['session'],
  queryFn: getSessionFn,
  staleTime: 60_000,
  gcTime: Infinity,
})

export const authBeforeLoader = async ({
  redirectToIfAuth,
  redirectToIfNotAuth,
  context,
}: {
  redirectToIfAuth?: ValidateRedirectOptions
  redirectToIfNotAuth?: ValidateRedirectOptions
  context: {
    queryClient: QueryClient
  }
}) => {
  // Cache session data
  const session = await context.queryClient.ensureQueryData(
    sessionQueryDataConfiq,
  )
  // is Authenticated? If so, redirect to profile
  if (session.data?.user && redirectToIfAuth) {
    throw redirect(redirectToIfAuth)
  }

  if (!session.data?.user && redirectToIfNotAuth) {
    throw redirect(redirectToIfNotAuth)
  }
}
