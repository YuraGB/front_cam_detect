/**
 * UserProfile component displays the user's profile information and provides a sign-out button.
 * @param param0 
 * @returns 
 */
export const UserProfile = ({
    userName,
    onSignOut
}: {
    userName: string
    onSignOut: () => void
}) => {
    return (
        <section className="container m-auto flex flex-col items-center justify-center py-10 px-4">
        <div className="flex items-center justify-center py-10 flex-col">
          <div
            className="h-20 w-20 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center"
            style={{ viewTransitionName: 'user-icon' }}
          >
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {userName.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full max-w-xs m-auto h-9 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Sign out
        </button>
      </section>
    )
}