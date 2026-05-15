import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/address/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/address/" from auth route group!</div>
}
