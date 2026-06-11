import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuthForm } from '#/modules/Auth/hooks/useAuthForm'

vi.mock('#/lib/auth-client', () => ({
  signIn: {
    email: vi.fn(),
  },
  signUp: {
    email: vi.fn(),
  },
}))

describe('useAuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize form state correctly', async () => {
    const { result } = renderHook(() => useAuthForm())

    expect(result.current.session).toBeNull()
    expect(result.current.isSignUp).toBe(false)
    expect(result.current.email).toBe('')
    expect(result.current.password).toBe('')
    expect(result.current.name).toBe('')
    expect(result.current.error).toBe('')
    expect(result.current.loading).toBe(false)
  })

  it('should handle email sign in', async () => {
    const mockSignIn = vi.fn()(
      vi
        .mocked(vi.importActual('#/lib/auth-client').signIn.email)
        .mockResolvedValue({ error: null }),
    )

    const { result } = renderHook(() => useAuthForm())

    await waitFor(() => expect(result.current.loading).toBe(true))

    result.current.handleSubmit({})

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      ),
    )
  })

  it('should handle email sign up', async () => {
    const mockSignUp = vi.fn()(
      vi
        .mocked(vi.importActual('#/lib/auth-client').signUp.email)
        .mockResolvedValue({ error: null }),
    )

    const { result } = renderHook(() => useAuthForm())

    await waitFor(() => expect(result.current.loading).toBe(true))

    result.current.handleSubmit('test@example.com', 'password123', 'John Doe')

    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'John Doe',
      ),
    )
  })

  it('should set error when sign in fails', async () => {
    const mockSignIn = vi.fn()(
      vi
        .mocked(vi.importActual('#/lib/auth-client').signIn.email)
        .mockResolvedValue({ error: { message: 'Invalid credentials' } }),
    )

    const { result } = renderHook(() => useAuthForm())

    await waitFor(() => expect(result.current.loading).toBe(true))

    result.current.handleSubmit('test@example.com', 'password123')

    await waitFor(() =>
      expect(result.current.error).toBe('Invalid credentials'),
    )
  })

  it('should set error when sign up fails', async () => {
    const mockSignUp = vi.fn()(
      vi
        .mocked(vi.importActual('#/lib/auth-client').authClient.signUp.email)
        .mockResolvedValue({ error: { message: 'Email already exists' } }),
    )

    const { result } = renderHook(() => useAuthForm())

    await waitFor(() => expect(result.current.loading).toBe(true))

    result.current.handleSubmit('test@example.com', 'password123', 'John Doe')

    await waitFor(() =>
      expect(result.current.error).toBe('Email already exists'),
    )
  })

  it('should handle unexpected errors', async () => {
    const mockSignIn = vi.fn()(
      vi
        .mocked(vi.importActual('#/lib/auth-client').signIn.email)
        .mockRejectedValue(new Error('Network error')),
    )

    const { result } = renderHook(() => useAuthForm())

    await waitFor(() => expect(result.current.loading).toBe(true))

    result.current.handleSubmit('test@example.com', 'password123')

    await waitFor(() =>
      expect(result.current.error).toBe('An unexpected error occurred'),
    )
  })

  it('should update form fields when state changes', async () => {
    const { result } = renderHook(() => useAuthForm())

    await waitFor(() => expect(result.current.loading).toBe(true))

    result.current.setEmail('new@example.com')
    result.current.setPassword('newpassword123')
    result.current.setName('New Name')

    await waitFor(
      () =>
        expect(result.current.email).toBe('new@example.com') &&
        expect(result.current.password).toBe('newpassword123') &&
        expect(result.current.name).toBe('New Name'),
    )
  })

  it('should return user image from session', async () => {
    const mockSignIn = vi.fn()(
      vi
        .mocked(vi.importActual('#/lib/auth-client').signIn.email)
        .mockResolvedValue({
          error: null,
          user: { image: 'https://example.com/avatar.jpg' },
        }),
    )

    const { result } = renderHookWithRestoredContext(() => useAuthForm())

    await waitFor(() => expect(result.current.loading).toBe(true))

    result.current.handleSubmit('test@example.com', 'password123')

    await waitFor(() =>
      expect(result.current.image).toBe('https://example.com/avatar.jpg'),
    )
  })
})
