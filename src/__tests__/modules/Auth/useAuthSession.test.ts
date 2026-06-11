import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuthSession } from '#/modules/Auth/hooks/useAuthSession'

vi.mock('#/lib/auth-client', () => ({
  signIn: {
    email: vi.fn(),
  },
}))

describe('useAuthSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null session and loading state', async () => {
    const { result } = renderHook(() => useAuthSession())

    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle sign in successfully', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.email).mockResolvedValue({ 
      error: null, 
      user: { name: 'Test User' } 
    }))

    const { result } = renderHook(() => useAuthSession())

    await waitFor(() => expect(result.current.loading).toBe(true))
    
    result.current.handleSignIn('test@example.com', 'password123')

    await waitFor(() => expect(result.current.session?.user.name).toBe('Test User'))
  })

  it('should handle sign in with unexpected errors', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.email).mockRejectedValue(new Error('Network error')))

    const { result } = renderHook(() => useAuthSession())

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

    const { result } = renderHook(() => useAuthSession())

    await waitFor(() => expect(result.current.loading).toBe(true))
    
    result.current.handleSignIn('test@example.com', 'password123')

    await waitFor(() => expect(result.current.session?.user).toBeNull())
  })
})
