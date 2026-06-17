const isDev = import.meta.env.DEV
const isBrowser = typeof window !== 'undefined'

const methods = ['log', 'info', 'warn', 'error', 'debug'] as const

type ConsoleMethod = (typeof methods)[number]

const methodStyles: Record<
  ConsoleMethod,
  {
    badge: string
    text: string
  }
> = {
  log: {
    badge:
      'background:#3b82f6;color:white;padding:2px 6px;border-radius:4px;font-weight:bold',
    text: 'color:#93c5fd;font-weight:600',
  },

  info: {
    badge:
      'background:#06b6d4;color:white;padding:2px 6px;border-radius:4px;font-weight:bold',
    text: 'color:#67e8f9;font-weight:600',
  },

  warn: {
    badge:
      'background:#f59e0b;color:black;padding:2px 6px;border-radius:4px;font-weight:bold',
    text: 'color:#fcd34d;font-weight:600',
  },

  error: {
    badge:
      'background:#ef4444;color:white;padding:2px 6px;border-radius:4px;font-weight:bold',
    text: 'color:#fca5a5;font-weight:600',
  },

  debug: {
    badge:
      'background:#8b5cf6;color:white;padding:2px 6px;border-radius:4px;font-weight:bold',
    text: 'color:#c4b5fd;font-weight:600',
  },
}

const getCallerInfo = () => {
  const stack = new Error().stack

  if (!stack) return ''

  const lines = stack.split('\n')

  const callerLine = lines[3]

  if (!callerLine) return ''

  const sourceMatch = callerLine.match(/source=([^ ]+)/)

  if (sourceMatch?.[1]) {
    return decodeURIComponent(sourceMatch[1])
  }

  return callerLine.trim()
}

const createLogger = (method: ConsoleMethod) => {
  return (...args: unknown[]) => {
    const shouldLog = isDev || method === 'warn' || method === 'error'

    if (!shouldLog) return

    const caller = getCallerInfo()

    const time = new Date().toLocaleTimeString()

    const runtime = isBrowser ? 'CLIENT' : 'SERVER'

    /**
     * BROWSER
     */
    if (isBrowser) {
      const style = methodStyles[method]

      console[method](
        `%c ${runtime} %c ${method.toUpperCase()} %c ${time} %c ${caller}`,
        'background:#111827;color:#10b981;padding:2px 6px;border-radius:4px;font-weight:bold',
        style.badge,
        'color:#9ca3af;font-weight:500',
        style.text,
        ...args,
      )

      return
    }

    /**
     * SERVER
     * Node console does not support CSS styles.
     */
    const prefix = `[${runtime}] ` + `[${method.toUpperCase()}] ` + `[${time}]`

    if (caller) {
      console[method](prefix, caller, ...args)
      return
    }

    console[method](prefix, ...args)
  }
}

export const logger = Object.fromEntries(
  methods.map((method) => [method, createLogger(method)]),
) as Record<ConsoleMethod, (...args: unknown[]) => void>
