import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/test/')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <>
      {' '}
      <button
        onClick={() =>
          router.navigate({
            to: '/',
            viewTransition: {
              types: ['slide-right'],
            },
          })
        }
      >
        Home
      </button>
      <div className="grid w-full gap-4 rounded-xl border border-[var(--line)] bg-[var(--header-bg)] p-4 grid-cols-2">
        <ul>
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <li key={id}>
              <Link
                to="/test/$id"
                params={{ id: String(id) }}
                viewTransition={true}
                onClick={() => setActiveId(String(id))}
              >
                <img
                  src={`/image-${id}.jpg`}
                  style={{
                    viewTransitionName:
                      activeId === String(id) ? `image-${id}` : 'none',
                  }}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
