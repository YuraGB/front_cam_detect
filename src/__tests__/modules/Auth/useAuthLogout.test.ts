import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthLogout } from '#/modules/Auth/hooks/useAuthLogout'

vi.mock('#/lib/auth-client', () => ({
  signOut: vi.fn(),
}))

describe('useAuthLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null session and loading state', async () => {
    const { result } = renderHook(() => useAuthLogout())

    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle logout successfully when session exists', async () => {
    const mockSignOut = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signOut).mockResolvedValue({ error: null }))

    const { result } = renderHook(() => useAuthLogout())

    act(() => {
      result.current.handleLogout()
    })

    await expect(mockSignOut).toHaveBeenCalled()
  })

  it('should handle logout with unexpected errors', async () => {
    const mockSignOut = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signOut).mockRejectedValue(new Error('Network error')))

    const { result } = renderHook(() => useAuthLogout())

    act(() => {
      result.current.handleLogout()
    })

    await expect(mockSignOut).toHaveBeenCalled()
  })

  it('should handle logout when session is null', async () => {
    const mockSignOut = vi.fn()
    (vi.mocked(vi.importActual('#/lib/auth-client').signOut).mockResolvedValue({ error: null }))

    const { result } = renderHook(() => useAuthLogout())

    act(() => {
      result.current.handleLogout()
    })

    await expect(mockSignOut).toHaveBeenCalled()
  })
})
