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
    return null
  }
}
