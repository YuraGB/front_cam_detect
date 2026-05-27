import { isRouteErrorResponse, useRouter } from '@tanstack/react-router'

export function RootErrorBoundary({ error }: { error: Error }) {
  const router = useRouter()
  
  let errorMessage = 'An unexpected error occurred'
  let statusCode = 500

  if (isRouteErrorResponse(error)) {
    statusCode = error.status
    errorMessage = error.statusText
    if (error.data?.message) {
      errorMessage = error.data.message
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <html>
      <head>
        <title>Error</title>
      </head>
      <body className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            {statusCode}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
            {errorMessage}
          </p>
          <button
            onClick={() => {
              router.invalidate()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
