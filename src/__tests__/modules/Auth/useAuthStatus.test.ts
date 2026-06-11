import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuthStatus } from '#/modules/Auth/hooks/useAuthStatus'

vi.mock('#/lib/auth-client', () => ({
  signIn: {
    email: vi.fn(),
  },
}))

describe('useAuthStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null user and session', async () => {
    const { result } = renderHook(() => useAuthStatus())

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle sign in successfully', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.email).mockResolvedValue({ 
      error: null, 
      user: { name: 'Test User' } 
    }))

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => expect(result.current.loading).toBe(true))
    
    result.current.handleSignIn('test@example.com', 'password123')

    await waitFor(() => expect(result.current.user?.name).toBe('Test User'))
  })

  it('should handle sign in with unexpected errors', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importAuthStatus().signIn.email).mockRejectedValue(new Error('Network error')))

    const { result } = renderHook(() => useAuthStatus())

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

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => expect(result.current.loading).toBe(true))
    
    result.current.handleSignIn('test@example.com', 'password123')

    await waitFor(() => expect(result.current.user).toBeNull())
  })
})
