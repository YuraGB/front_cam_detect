import { tryCatch } from '#/lib/asyncActionHandler'
import type { TExtendedUser } from '#/types'
import { useRouter } from '@tanstack/react-router'
import type { Session } from 'better-auth'

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
