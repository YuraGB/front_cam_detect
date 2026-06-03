const isDev = import.meta.env.DEV

// Console methods ex.: console.log; console.warn etc...
const methods = ['log', 'info', 'warn', 'error', 'debug'] as const

type ConsoleMethod = (typeof methods)[number]

/**
 * A logger that wraps the native console methods.
 * In development mode, all methods are enabled.
 * In production mode, only 'warn' and 'error' are enabled to reduce noise in the console.
 */
export const logger = Object.fromEntries(
  methods.map((method) => [
    method,
    (...args: unknown[]) => {
      const shouldLog = isDev || method === 'warn' || method === 'error'

      if (shouldLog) {
        console[method].apply(console, args)
      }
    },
  ]),
) as Record<ConsoleMethod, (...args: unknown[]) => void>
