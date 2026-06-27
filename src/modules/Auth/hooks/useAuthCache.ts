import { tryCatch } from '#/lib/asyncActionHandler'
import { getPermissionsFn, getSessionFn } from '#/lib/getSession'
import type { TExtendedSession } from '#/types'
import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { Session, User } from 'better-auth'

export const sessionQueryDataConfiq = queryOptions({
  queryKey: ['session'],
  queryFn: getSessionFn,
  staleTime: 60_000,
  gcTime: Infinity,
})

export const permissionsQueryDataConfig = (email: string) =>
  queryOptions({
    queryKey: ['permissions', email],
    queryFn: () => getPermissionsFn({ data: { email } }),
    staleTime: 60_000,
    gcTime: Infinity,
  })

export const getCurrentSessionUserFromContext = async (context: {
  queryClient: QueryClient
}): Promise<TExtendedSession | null> => {
  return await context.queryClient.ensureQueryData(sessionQueryDataConfiq)
}

export const useAuthCache = () => {
  const router = useRouter()
  const { queryClient } = router.options.context

  const removeSessionFromCache = (): void => {
    queryClient.setQueryData(['session'], null)
    queryClient.removeQueries({ queryKey: ['session'] })
    queryClient.invalidateQueries({ queryKey: ['session'] })
  }

  const setUserSessionInToTheCache = (
    user: TExtendedSession,
  ): TExtendedSession => {
    queryClient.setQueryData<TExtendedSession>(['user'], user)

    return user
  }

  const setSessionToTheCache = async (
    email: string,
    session: { session: Session; user: User },
  ) => {
    const permissions = await tryCatch(() =>
      queryClient.fetchQuery(permissionsQueryDataConfig(email)),
    )

    if (permissions.error) return

    if (Array.isArray(permissions.data)) {
      const extendetSession = {
        session: session.session,
        user: {
          ...session.user,
          permissions: permissions.data,
        },
      }
      const cacheSession = await tryCatch(
        async () =>
          await queryClient.setQueryData(['session'], extendetSession),
      )

      if (cacheSession.error) return

      router.navigate({
        to: '/profile',
        replace: true,
      })
    }
  }

  return {
    removeSessionFromCache,
    setUserSessionInToTheCache,
    setSessionToTheCache,
  }
}
