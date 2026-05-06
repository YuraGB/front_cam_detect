import { authClient } from '#/lib/auth-client'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const useAuthForm = () => {
  const { data: session } = authClient.useSession()
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      router.navigate({
        to: '/profile',
        viewTransition: true,
      })
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          email,
          password,
          name,
        })
        if (result.error) {
          setError(result.error.message || 'Sign up failed')
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        })
        if (result.error) {
          setError(result.error.message || 'Sign in failed')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
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
