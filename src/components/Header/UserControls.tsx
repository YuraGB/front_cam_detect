import BetterAuthHeader from '../../integrations/better-auth/header-user'
import ParaglideLocaleSwitcher from '../LocaleSwitcher'
import ThemeToggle from '../ThemeToggle'

/**
 * UserControls component - User interaction controls and utilities
 */
export default function UserControls() {
  return (
    <div className="flex items-center gap-1.5 sm:ml-0 sm:gap-2">
      <ParaglideLocaleSwitcher />
      <BetterAuthHeader />
      <ThemeToggle />
    </div>
  )
}
