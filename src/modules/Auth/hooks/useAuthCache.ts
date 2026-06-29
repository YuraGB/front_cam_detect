import { tryCatch } from '#/lib/asyncActionHandler'
import { getPermissionsFn, getSessionFn } from '#/lib/getSession'
import type { TExtendedUser } from '#/types'
import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { Session } from 'better-auth'

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
  const session = await context.queryClient.ensureQueryData(
    sessionQueryDataConfiq,
  )
  return session?.user ?? null
}

export const useAuthCache = () => {
  const router = useRouter()
  const { queryClient } = router.options.context

  /**
   * Remove session from the state
   */
  const removeSessionFromCache = (): void => {
    queryClient.removeQueries({ queryKey: ['session'] })
    queryClient.invalidateQueries({ queryKey: ['session'] })
  }

  /**
   * Set Extended session to the storage
   * @param session
   */
  const setSessionToTheCache = async (session: {
    session: Session
    user: TExtendedUser
  }) => {
    const cacheSession = await tryCatch(
      async () => await queryClient.setQueryData(['session'], session),
    )

    if (cacheSession.error) {
      const error = cacheSession.error as unknown
      const msg =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : JSON.stringify(error)

      throw new Error(msg)
    }

    router.navigate({
      to: '/profile',
      replace: true,
    })
  }

  return {
    removeSessionFromCache,
    setSessionToTheCache,
  }
}
