import { createFileRoute } from '@tanstack/react-router'
// import { Auth } from '#/modules/Auth'
import { VideoStream } from '#/modules/VideoStream'

export const Route = createFileRoute('/')({ component: App, ssr: false })

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* <Auth /> */}
      <VideoStream />
    </main>
  )
}
