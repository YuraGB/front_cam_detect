import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="page-wrap">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard! This is a protected route.</p>
    </div>
  )
}
