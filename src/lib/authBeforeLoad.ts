import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { getSessionFn } from './getSession'
import { redirect } from '@tanstack/react-router'
import type {
  ParsedLocation,
  ValidateRedirectOptions,
} from '@tanstack/react-router'

export const sessionQueryDataConfiq = queryOptions({
  queryKey: ['session'],
  queryFn: getSessionFn,
  staleTime: 60_000,
  gcTime: Infinity,
})

export const authBeforeLoader = async ({
  redirectToIfAuth,
  redirectToIfNotAuth,
  context,
  location,
}: {
  redirectToIfAuth?: ValidateRedirectOptions
  redirectToIfNotAuth?: ValidateRedirectOptions
  context: {
    queryClient: QueryClient
  }
  location?: ParsedLocation
}) => {
  // Cached session data in react-query
  const session = await context.queryClient.ensureQueryData(
    sessionQueryDataConfiq,
  )
  const user = session?.data?.user
  const isAuthed = !!user
  const isRoot = (location?.pathname ?? '/') === '/'

  if (isAuthed && redirectToIfAuth && isRoot) {
    throw redirect(redirectToIfAuth)
  }

  if (!isAuthed && redirectToIfNotAuth && !isRoot) {
    throw redirect(redirectToIfNotAuth)
  }
}
