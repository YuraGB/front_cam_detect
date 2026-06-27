import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import type {
  ParsedLocation,
  ValidateRedirectOptions,
} from '@tanstack/react-router'
import { sessionQueryDataConfiq } from '#/modules/Auth/hooks/useAuthCache'

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
  console.log(26, session)
  const user = session?.user
  const isAuthed = !!user
  const isRoot = (location?.pathname ?? '/') === '/'

  if (isAuthed && redirectToIfAuth && isRoot) {
    throw redirect(redirectToIfAuth)
  }

  if (!isAuthed && redirectToIfNotAuth && !isRoot) {
    throw redirect(redirectToIfNotAuth)
  }
}
