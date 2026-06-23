import { getQueryContext } from '#/integrations/tanstack-query/query-client'
import { logger } from '#/lib/frontend_logger'
import { authClient } from '#/modules/Auth/betterAuthClient/auth-client'
import { useRouter } from '@tanstack/react-router'

const queryClient = getQueryContext().queryClient

const emailSignUp = async (email: string, password: string, name: string) => {
  const result = await authClient.signUp.email({
    email,
    password,
    name,
  })
  queryClient.setQueryData(['session'], result)
  return result
}

export const useAuthFunctions = () => {
  const router = useRouter()

  const emailSignIn = async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    })

    queryClient.setQueryData(['session'], result)
    return result
  }

  const signOut = async () => {
    const logOut = await authClient.signOut()
    if (logOut.error) {
      logger.error(logOut.error)
      return
    }

    // remove from the cache/storage
    queryClient.setQueryData(['session'], null)
    queryClient.removeQueries({ queryKey: ['session'] })

    document.startViewTransition(() => {
      void router.navigate({ to: '/', replace: true })
    })
  }

  return {
    signOut,
    emailSignIn,
    emailSignUp,
  }
}
