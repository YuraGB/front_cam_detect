const isDev = import.meta.env.DEV

const methods = ['log', 'info', 'warn', 'error', 'debug'] as const

type ConsoleMethod = (typeof methods)[number]

export const logger = Object.fromEntries(
  methods.map((method) => [
    method,
    (...args: unknown[]) => {
      const shouldLog =
        isDev || method === 'warn' || method === 'error'

      if (shouldLog) {
        console[method].apply(console, args)
      }
    },
  ]),
) as Record<ConsoleMethod, (...args: unknown[]) => void>