import { Link } from '@tanstack/react-router'

/**
 * NavigationLinks component - Main navigation links with text labels
 */
export default function NavigationLinks() {
  return (
    <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
      <Link
        to="/dashboard"
        className="nav-link"
        activeProps={{ className: 'nav-link is-active' }}
      >
        Home
      </Link>
    </div>
  )
}
