import { ImagesList } from '#/modules/Images'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/test/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ImagesList />
}
