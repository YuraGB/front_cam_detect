import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthRegister } from '#/modules/Auth/hooks/useAuthRegister'

vi.mock('#/lib/auth-client', () => ({
  signUp: {
    password: vi.fn(),
  },
}))

describe('useAuthRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null session and loading state', async () => {
    const { result } = renderHook(() => useAuthRegister())

    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle registration successfully', async () => {
    const mockSignUp = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signUp.password).mockResolvedValue({ 
      error: null, 
      user: { name: 'New User' } 
    }))

    const { result } = renderHook(() => useAuthRegister())

    act(() => {
      result.current.handleRegister('test@example.com', 'password123')
    })

    await expect(mockSignUp.password).toHaveBeenCalled()
  })

  it('should handle registration with unexpected errors', async () => {
    const mockSignUp = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signUp.password).mockRejectedValue(new Error('Network error')))

    const { result } = renderHook(() => useAuthRegister())

    act(() => {
      result.current.handleRegister('test@example.com', 'password123')
    })

    await expect(mockSignUp.password).toHaveBeenCalled()
  })

  it('should handle registration with invalid email format', async () => {
    const mockSignUp = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signUp.password).mockRejectedValue({ 
      message: 'Invalid email address' 
    }))

    const { result } = renderHook(() => useAuthRegister())

    act(() => {
      result.current.handleRegister('invalid-email', 'password123')
    })

    await expect(mockSignUp.password).toHaveBeenCalled()
  })

  it('should handle registration with invalid password format', async () => {
    const mockSignUp = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signUp.password).mockRejectedValue({ 
      message: 'Password must be at least 8 characters' 
    }))

    const { result } = renderHook(() => useAuthRegister())

    act(() => {
      result.current.handleRegister('test@example.com', 'weak')
    })

    await expect(mockSignUp.password).toHaveBeenCalled()
  })
})
