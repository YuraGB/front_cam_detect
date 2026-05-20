import { Link } from '@tanstack/react-router'

/**
 * Brand component - Displays the application logo/name
 */
export default function Brand() {
    return (
    <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
      >
        <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
        TanStack Start
      </Link>
    </h2>
  )
}

