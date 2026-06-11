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
