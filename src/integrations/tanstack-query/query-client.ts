import { QueryClient } from '@tanstack/react-query'

export type QueryContext = {
  queryClient: QueryClient
}

let browserContext: QueryContext | undefined

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
      },
    },
  })
}

export function getQueryContext(): QueryContext {
  if (typeof window === 'undefined') {
    return { queryClient: createQueryClient() }
  }

  if (!browserContext) {
    browserContext = { queryClient: createQueryClient() }
  }

  return browserContext
}
