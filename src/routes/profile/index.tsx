import { authClient } from '#/lib/auth-client'
import { createFileRoute, redirect, useLoaderData, useRouter } from '@tanstack/react-router'
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createServerFn } from '@tanstack/react-start';


export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();

    return await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: headers.get("cookie") || "",
        },
      },
    });
  }
);

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
  
  loader: async () => {
    const session = await getSessionFn() // Call the server function to get the session data

  if (!session?.data?.user) {
    throw redirect({
      to: '/',
    })
  }

  return session
}
})

function RouteComponent() {
  const session = useLoaderData({ from: '/profile/' })
  const router = useRouter()

  const user = session?.data?.user
  const name = user?.name || ''


  return (
    <section className='container m-auto flex flex-col items-center justify-center py-10 px-4'>
      <div className="flex items-center justify-center py-10 flex-col">
       <div className="h-20 w-20 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center" style={{viewTransitionName: 'user-icon'}}>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {name?.charAt(0).toUpperCase() || 'U'}
                </span>
        </div>
      </div>
          <button
            onClick={() => {
              void authClient.signOut()
              document.startViewTransition(() => {
  router.navigate({ to: '/' })
})
            }}
            className="w-full max-w-xs m-auto h-9 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Sign out
          </button>
          </section>
  )
}
