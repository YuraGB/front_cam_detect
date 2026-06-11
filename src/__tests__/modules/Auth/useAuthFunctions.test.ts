import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuthFunctions } from '#/modules/Auth/hooks/useAuthFunctions'

vi.mock('#/lib/auth-client', () => ({
  signOut: vi.fn(),
}))

describe('useAuthFunctions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null user and session', async () => {
    const { result } = renderHook(() => useAuthFunctions())

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle sign out successfully', async () => {
    const mockSignOut = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signOut).mockResolvedValue({ error: null }))

    const { result } = renderHook(() => useAuthFunctions())

    await waitFor(() => expect(result.current.loading).toBe(true))

    result.current.handleSignOut()

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledWith())
  })

  it('should handle unexpected errors during sign out', async () => {
    const mockSignOut = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signOut).mockRejectedValue(new Error('Network error')))

    const { result } = renderHook(() => useAuthFunctions())

    await waitFor(() => expect(result.current.loading).toBe(true))

    result.current.handleSignOut()

    await waitFor(() => expect(result.current.error).toBe('An unexpected error occurred'))
  })

  it('should return user data from session', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.email).mockResolvedValue({ 
      error: null, 
      user: { name: 'Test User' } 
    }))

    const { result } = renderHook(() => useAuthFunctions())

    await waitFor(() => expect(result.current.loading).toBe(true))
    
    result.current.handleSignIn('test@example.com', 'password123')

    await waitFor(() => expect(result.current.user?.name).toBe('Test User'))
  })

  it('should handle sign in with unexpected errors', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.email).mockRejectedValue(new Error('Network error')))

    const { result } = renderHook(() => useAuthFunctions())

    await waitFor(() => expect(result.current.loading).toBe(true))
    
    result.current.handleSignIn('test@example.com', 'password123')

    await waitFor(() => expect(result.current.error).toBe('An unexpected error occurred'))
  })

  it('should handle sign in with null user response', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.email).mockResolvedValue({ 
      error: null, 
      user: null 
    }))

    const { result } = renderHook(() => useAuthFunctions())

    await waitFor(() => expect(result.current.loading).toBe(true))
    
    result.current.handleSignIn('test@example.com', 'password123')

    await waitFor(() => expect(result.current.user).toBeNull())
  })
})
