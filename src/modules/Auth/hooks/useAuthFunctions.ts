import { getQueryContext } from '#/integrations/tanstack-query/query-client'
import { authClient } from '#/modules/Auth/betterAuthClient/auth-client'
import { useRouter } from '@tanstack/react-router'

const emailSignIn = async (email: string, password: string) => {
  const result = await authClient.signIn.email({
    email,
    password,
  })
  return result
}

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
  const signOut = () => {
    void authClient.signOut()
    // remove from the cache/storage
    getQueryContext().queryClient.removeQueries({ queryKey: ['session'] })
    document.startViewTransition(() => {
      router.navigate({ to: '/' })
    })
  }

  return {
    signOut,
    emailSignIn,
    emailSignUp,
  }
}
