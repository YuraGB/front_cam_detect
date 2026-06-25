import { logger } from '../frontend_logger'

type Result<T, TError = unknown> =
  | { data: T; error: null }
  | { data: null; error: TError }

export async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return {
      data: await fn(),
      error: null,
    }
  } catch (error) {
    logger.error('try catch has an error')
    return {
      data: null,
      error,
    }
  }
}

export function safeJsonParse<T = unknown>(value: string): T | null {
  try {
    return JSON.parse(value)
  } catch {
    logger.error('JSON parse failed', value)
    return null
  }
}

export function safeJsonStringify<T = unknown>(value: T): string {
  try {
    return JSON.stringify(value)
  } catch {
    logger.error('Json stringify failed', value)
    return ''
  }
}
