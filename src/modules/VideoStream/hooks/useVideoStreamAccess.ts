import { PERMISSIONS } from '#/constants'
import { isPermitted } from '#/lib/permissonsRoles'
import { useLoaderData } from '@tanstack/react-router'

export const useVideoStreamAccess = () => {
  const session = useLoaderData({ from: '/(protected)' })

  if (!session) return null

  const hasAccess = isPermitted(
    [
      PERMISSIONS.ALERTS_READ,
      PERMISSIONS.STREAM_READ,
      PERMISSIONS.DETECTION_READ,
    ],
    session.user,
  )

  return hasAccess
}
