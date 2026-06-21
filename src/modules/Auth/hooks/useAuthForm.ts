import { authClient } from '#/modules/Auth/betterAuthClient/auth-client'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuthFunctions } from './useAuthFunctions'
import { tryCatch } from '#/lib/asyncActionHandler'

export const useAuthForm = () => {
  const { data: session } = authClient.useSession()
  const { emailSignIn, emailSignUp } = useAuthFunctions()
  const router = useRouter()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!session?.user) return
    router.navigate({
      to: '/profile',
      replace: true,
    })
  }, [session?.user])

  const handleSubmit = async (e: React.FormEvent) => {
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
    image: session?.user.image || null,
  }
}
