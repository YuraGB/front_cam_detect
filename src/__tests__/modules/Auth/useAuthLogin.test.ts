import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthLogin } from '#/modules/Auth/hooks/useAuthLogin'

vi.mock('#/lib/auth-client', () => ({
  signIn: {
    password: vi.fn(),
  },
}))

describe('useAuthLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null session and loading state', async () => {
    const { result } = renderHook(() => useAuthLogin())

    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle login successfully', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.password).mockResolvedValue({ 
      error: null, 
      user: { name: 'Test User' } 
    }))

    const { result } = renderHook(() => useAuthLogin())

    act(() => {
      result.current.handleLogin('test@example.com', 'password123')
    })

    await expect(mockSignIn.password).toHaveBeenCalled()
  })

  it('should handle login with unexpected errors', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.password).mockRejectedValue(new Error('Network error')))

    const { result } = renderHook(() => useAuthLogin())

    act(() => {
      result.current.handleLogin('test@example.com', 'password123')
    })

    await expect(mockSignIn.password).toHaveBeenCalled()
  })

  it('should handle login with invalid credentials', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.password).mockRejectedValue({ 
      message: 'Invalid email or password' 
    }))

    const { result } = renderHook(() => useAuthLogin())

    act(() => {
      result.current.handleLogin('test@example.com', 'wrongpassword')
    })

    await expect(mockSignIn.password).toHaveBeenCalled()
  })

  it('should handle login with invalid email format', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.password).mockRejectedValue({ 
      message: 'Invalid email address' 
    }))

    const { result } = renderHook(() => useAuthLogin())

    act(() => {
      result.current.handleLogin('invalid-email', 'password123')
    })

    await expect(mockSignIn.password).toHaveBeenCalled()
  })

  it('should handle login with invalid password format', async () => {
    const mockSignIn = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signIn.password).mockRejectedValue({ 
      message: 'Password must be at least 8 characters' 
    }))

    const { result } = renderHook(() => useAuthLogin())

    act(() => {
      result.current.handleLogin('test@example.com', 'weak')
    })

    await expect(mockSignIn.password).toHaveBeenCalled()
  })
})
