import { PERMISSIONS } from '#/constants/permissions'
import { requirePermissions } from '#/lib/permissonsRoles'
import { VideoStream } from '#/modules/VideoStream'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/video_stream/')({
  ssr: false,
  beforeLoad: () =>
    requirePermissions([
      PERMISSIONS.ALERTS_READ,
      PERMISSIONS.STREAM_READ,
      PERMISSIONS.DETECTION_READ,
    ]),

  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <VideoStream />
    </main>
  )
}
