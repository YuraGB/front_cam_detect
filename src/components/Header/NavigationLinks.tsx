import { Link } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { useCurrentSession } from '#/modules/Auth/hooks/useCurrentSession'

/**
 * NavigationLinks component - Main navigation links with text labels
 */
export default function NavigationLinks() {
  const { data } = useCurrentSession()
  return (
    <div className="hidden md:inline order-3 flex w-full m-auto gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
      <Link
        to="/dashboard"
        className="nav-link"
        activeProps={{ className: 'nav-link is-active' }}
      >
        Home
      </Link>
      {/* {data && (
        <Button asChild variant="outline" size="sm">
          <Link to="/video_stream">See video stream</Link>
        </Button>
      )} */}
    </div>
  )
}
