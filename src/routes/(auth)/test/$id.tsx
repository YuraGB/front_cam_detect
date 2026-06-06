import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/test/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { id } = Route.useParams()

  return (
    <>
      <button
        onClick={() =>
          router.navigate({
            to: '/test',
            viewTransition: {
              types: ['slide-right'],
            },
          })
        }
      >
        Back
      </button>
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
