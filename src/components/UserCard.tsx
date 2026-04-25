export const UserCard = ({
  name,
  email,
  signOutHandler,
  image,
}: {
  name: string
  email: string
  signOutHandler: () => void
  image?: string | null
}) => {
        return (
      <div className="flex justify-center py-10 px-4">
        <div className="w-full max-w-md p-6 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold leading-none tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              You're signed in as {email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {image ? (
              <img src={image} alt="" className="h-10 w-10" />
            ) : (
              <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center" style={{viewTransitionName: 'user-icon'}}>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {email}
              </p>
            </div>
          </div>

          <button
            onClick={signOutHandler}
            className="w-full h-9 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Sign out
          </button>

          <p className="text-xs text-center text-neutral-400 dark:text-neutral-500">
            Built with{' '}
            <a
              href="https://better-auth.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              BETTER-AUTH
            </a>
            .
          </p>
        </div>
      </div>
    )
}

export default UserCard