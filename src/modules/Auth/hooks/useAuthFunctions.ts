import { logger } from '#/lib/frontend_logger'
import { authClient } from '#/modules/Auth/betterAuthClient/auth-client'
import { useRouter } from '@tanstack/react-router'
import { useAuthCache } from './useAuthCache'

const emailSignUp = async (email: string, password: string, name: string) => {
  const result = await authClient.signUp.email({
    email,
    password,
    name,
  })
  return result
}

export const useAuthFunctions = () => {
  const router = useRouter()
  const { removeSessionFromCache } = useAuthCache()

  const emailSignIn = async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    })

    return result
  }

  const signOut = async () => {
    const logOut = await authClient.signOut()
    if (logOut.error) {
      logger.error(logOut.error)
      return
    }

    // remove from the cache/storage
    removeSessionFromCache()

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
