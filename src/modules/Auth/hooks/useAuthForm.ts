import { authClient } from '#/modules/Auth/betterAuthClient/auth-client'

import { useEffect, useState } from 'react'
import { useAuthFunctions } from './useAuthFunctions'
import { tryCatch } from '#/lib/asyncActionHandler'
import { useAuthCache } from './useAuthCache'

export const useAuthForm = () => {
  const { data: session } = authClient.useSession()
  const { emailSignIn, emailSignUp } = useAuthFunctions()
  const { setSessionToTheCache } = useAuthCache()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!session?.user) return
    setSessionToTheCache(session).catch((e) => {
      setLoading(false)
      setError(e)
    })
  }, [session?.user])

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let result = null

    if (isSignUp) {
      result = await tryCatch(() => emailSignUp(email, password, name))
    } else {
      result = await tryCatch(() => emailSignIn(email, password))
    }

    if (result.error) {
      const errorMessage =
        result.error instanceof Error
          ? result.error.message
          : typeof result.error === 'object' &&
              'message' in result.error &&
              typeof (result.error as any).message === 'string'
            ? (result.error as { message: string }).message
            : 'An error occurred during authentication'

      setError(errorMessage)
      setLoading(false)
    }

    if (!result.data) {
      setError('Somethig went wrong')
      setLoading(false)
    }
  }

  return {
    session,
    isSignUp,
    email,
    password,
    name,
    error,
    loading,
    setIsSignUp,
    setEmail,
    setPassword,
    setName,
    handleSubmit,
    setError,
  }
}
