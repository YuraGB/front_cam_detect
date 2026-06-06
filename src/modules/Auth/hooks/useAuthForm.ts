import { authClient } from '#/lib/auth-client'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuthFunctions } from './useAuthFunctions'

export const useAuthForm = () => {
  const { data: session } = authClient.useSession()
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<boolean>(false)
  const { emailSignIn, emailSignUp } = useAuthFunctions()

  useEffect(() => {
    if (session?.user) {
      router.navigate({
        to: '/profile',
        viewTransition: true,
      })
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let result = null

    try {
      if (isSignUp) {
        result = await emailSignUp(email, password, name)
      } else {
        result = await emailSignIn(email, password)
      }

      if (result.error) {
        setError(
          result.error.message || 'An error occurred during authentication',
        )
        setLoading(false)
        return
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
    // finally {
    //   // There is a blick in the UI when we set loading to false here,
    //   // so we will rely on the session effect to navigate and hide the form
    //   setLoading(false)
    // }
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
