import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { getQueryContext } from './integrations/tanstack-query/query-client'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    // defaultViewTransition: true,

    context: getQueryContext(),

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
