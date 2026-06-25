import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

export default function TanStackQueryProvider({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const { queryClient } = router.options.context

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
