/* react-doctor-disable react-doctor/only-export-components */
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'

import TanStackQueryProvider from '#/integrations/tanstack-query/root-provider'
import TanStackQueryDevtools from '#/integrations/tanstack-query/devtools.tsx'
import { getLocale } from '#/paraglide/runtime'
import { Header } from '#/components/Header/Header'
import Footer from '#/components/Footer'
import { RootErrorBoundary } from '#/components/ErrorBoundary'

import appCss from '../styles.css?url'
import { THEME_INIT_SCRIPT } from '#/constants'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale())
    }
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  errorComponent: ({ error }) => <RootErrorBoundary error={error} />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        {/* react-doctor-disable-next-line */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)] ">
        <TanStackQueryProvider>
          <Header />
          <main className="container m-auto flex min-h-screen flex-col py-10 px-4 ">
            {children || <Outlet />}
          </main>
          <Footer />
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </TanStackQueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
