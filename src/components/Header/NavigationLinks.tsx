import { Link } from '@tanstack/react-router'
import { m } from '#/paraglide/messages.js'

/**
 * NavigationLinks component - Main navigation links with text labels
 */
export default function NavigationLinks() {
  return (
    <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
      <Link
        to="/"
        className="nav-link"
        activeProps={{ className: 'nav-link is-active' }}
      >
        Home
      </Link>
      <span>{m.learn_inlang()}</span>
      <span>{m.about_page()}</span>
    </div>
  )
}
