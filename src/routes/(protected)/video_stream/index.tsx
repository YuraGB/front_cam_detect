import { PERMISSIONS } from '#/constants/permissions'
import { isPermitted } from '#/lib/permissonsRoles'
import { VideoStream } from '#/modules/VideoStream'
import type { TExtendedUser } from '#/types'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/video_stream/')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
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

  if (!hasAccess) {
    return
  }
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <VideoStream />
    </main>
  )
}
