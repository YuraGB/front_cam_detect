import { tryCatch } from '#/lib/asyncActionHandler'
import { getPermissionsFn, getSessionFn } from '#/lib/getSession'
import type { TExtendedUser } from '#/types'
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
}): Promise<TExtendedUser | null> => {
  return await context.queryClient.ensureQueryData(sessionQueryDataConfiq)
}

export const useAuthCache = () => {
  const router = useRouter()
  const { queryClient } = router.options.context

  const removeSessionFromCache = (): void => {
    queryClient.removeQueries({ queryKey: ['session'] })
    queryClient.invalidateQueries({ queryKey: ['session'] })
  }

  const setUserSessionInToTheCache = (user: TExtendedUser): TExtendedUser => {
    queryClient.setQueryData<TExtendedUser>(['user'], user)

    return user
  }

  const setSessionToTheCache = async (session: {
    session: Session
    user: User
  }) => {
    const permissions = await tryCatch(() =>
      queryClient.fetchQuery(permissionsQueryDataConfig(session.user.email)),
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

      if (cacheSession.error) {
        const msg =
          typeof cacheSession.error === 'string'
            ? cacheSession.error
            : cacheSession.error instanceof Error
              ? cacheSession.error.message
              : JSON.stringify(cacheSession.error)

        throw new Error(msg)
      }

      router.navigate({
        to: '/profile',
        replace: true,
      })
      return
    } else {
      throw new Error("The user doesn't have any permissions")
    }
  }

  return {
    removeSessionFromCache,
    setUserSessionInToTheCache,
    setSessionToTheCache,
  }
}
