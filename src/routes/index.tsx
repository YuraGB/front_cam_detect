import Canvas from '#/components/canvasComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <Canvas streamType='ws://localhost:3002/ws/live'/>
       <Canvas streamType='ws://localhost:3002/ws/detection'/>
    </main>
  )
}
