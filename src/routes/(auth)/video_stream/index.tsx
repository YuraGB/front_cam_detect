import { PERMISSIONS } from '#/constants/permissions'
import { requirePermissions } from '#/lib/permissonsRoles'
import { VideoStream } from '#/modules/VideoStream'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/video_stream/')({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    console.log(error.message)
    if (error.message === 'Forbidden') {
      return <div>Access denied</div>
    }

    return <div>Something went wrong</div>
  },
  beforeLoad: () =>
    requirePermissions([
      PERMISSIONS.ALERTS_READ,
      PERMISSIONS.STREAM_READ,
      PERMISSIONS.DETECTION_READ,
    ]),
  ssr: false,
})

function RouteComponent() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <VideoStream />
    </main>
  )
}
