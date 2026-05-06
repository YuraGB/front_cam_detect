import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import type { Router } from '@tanstack/react-router'
import { useState } from 'react'
import { flushSync } from 'react-dom'

export const Route = createFileRoute('/test/')({
  component: RouteComponent,
})

export function navigateWithTransition(router: Router<any>, to: string) {
  if (!('startViewTransition' in document)) {
    router.navigate({ to })
    return
  }

  document.startViewTransition(() => {
    flushSync(() => {
      console.log('Navigating with view transition to', to)
      router.navigate({ to, viewTransition: true })
    })
  })
}

function RouteComponent() {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <>
      {' '}
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
