import { QueryClient } from '@tanstack/react-query'

let context:
  | {
      queryClient: QueryClient
    }
  | undefined

export function getQueryContext() {
  if (context) return context

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
      },
    },
  })

  context = { queryClient }

  return context
}
