import { VideoStream } from '#/modules/VideoStream'
import { useVideoStreamAccess } from '#/modules/VideoStream/hooks/useVideoStreamAccess'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/video_stream/')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  const hasAccess = useVideoStreamAccess()
  if (!hasAccess) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <VideoStream />
    </main>
  )
}
