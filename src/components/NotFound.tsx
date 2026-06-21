// src/components/not-found.tsx

import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>

      <p className="text-muted-foreground">The page was not found</p>

      <Link to="/" className="rounded border px-4 py-2 hover:bg-accent">
        Redirect ro the Home page
      </Link>
    </div>
  )
}
