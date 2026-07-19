import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import type {
  ParsedLocation,
  ValidateRedirectOptions,
} from '@tanstack/react-router'
import { getCurrentSessionUserFromContext } from './getCurrentSessionFromContext'

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
  // get/fetch (cached first) session data from react-query
  const user = await getCurrentSessionUserFromContext(context)

  const isAuthed = !!user
  const isRoot = (location?.pathname ?? '/') === '/'

  if (isAuthed && redirectToIfAuth && isRoot) {
    throw redirect(redirectToIfAuth)
  }

  if (!isAuthed && redirectToIfNotAuth && !isRoot) {
    throw redirect(redirectToIfNotAuth)
  }
}
