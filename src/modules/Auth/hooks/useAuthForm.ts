import { authClient } from "#/lib/auth-client"
import { useState } from "react"

export const useAuthForm = () => {
    const { data: session, isPending } = authClient.useSession()
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

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
    isPending,
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
    image: session?.user?.image || null,
  }
}