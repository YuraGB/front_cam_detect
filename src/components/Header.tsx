import UserControls from './Header/UserControls'
import NavigationLinks from './Header/NavigationLinks'

/**
 * Header component
 * @returns
 */
const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex gap-x-3 gap-y-2 py-3 sm:py-4 justify-between flex-row-reverse">
        <NavigationLinks />
        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <UserControls />
        </div>
      </nav>
    </header>
  )
}

export { Header }
