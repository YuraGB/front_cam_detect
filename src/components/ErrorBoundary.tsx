import { useRouter } from '@tanstack/react-router'

export function RootErrorBoundary({ error }: { error: Error }) {
  const router = useRouter()

  let errorMessage = 'An unexpected error occurred'
  const statusCode = 500

  if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          {statusCode}
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={() => {
            router.invalidate()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
