import { createFileRoute, redirect} from '@tanstack/react-router'
import { Auth } from '#/modules/Auth'
import { getSessionFn } from './profile'
// import { VideoStream } from '#/modules/VideoStream'

export const Route = createFileRoute('/')({ component: App, ssr: true,beforeLoad: async () => {
  // is Authenticated? If so, redirect to profile
  const session = await getSessionFn()

  if (session?.data?.user) {
    throw redirect({ to: '/profile' })
  }
} })

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <Auth />
      {/* <VideoStream /> */}
    </main>
  )
}
