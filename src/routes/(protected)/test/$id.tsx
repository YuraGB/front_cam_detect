import { Button } from '#/components/ui/button'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { MoveLeft } from 'lucide-react'

export const Route = createFileRoute('/(protected)/test/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { id } = Route.useParams()

  return (
    <>
      <Button
        variant={'secondary'}
        className=" py-1 ml-2"
        onClick={() =>
          router.navigate({
            to: '/test',
            viewTransition: {
              types: ['slide-right'],
            },
          })
        }
      >
        <MoveLeft />
        Back
      </Button>
      <div className="grid w-full gap-4 rounded-xl border border-[var(--line)] bg-[var(--header-bg)] p-4 ">
        <img
          src={`/image-${id}.jpg`}
          alt={`Another random view ${id}`}
          style={{ viewTransitionName: `image-${id}` }}
        />
      </div>
    </>
  )
}
