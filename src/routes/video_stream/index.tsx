import { VideoStream } from '#/modules/VideoStream'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/video_stream/')({
  component: RouteComponent,
  ssr: false,
})

function RouteComponent() {
  return (
        <main className="page-wrap px-4 pb-8 pt-14">
          <VideoStream />
        </main>
  )
}
