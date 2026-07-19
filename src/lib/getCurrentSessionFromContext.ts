import { queryOptions } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { getSessionFn } from "./getSession"
import type { TExtendedUser } from "#/types"
import type { Session } from "better-auth"

export const sessionQueryDataConfiq = queryOptions({
  queryKey: ['session'],
  queryFn: getSessionFn,
  staleTime: 60_000,
  gcTime: Infinity,
})

export const getCurrentSessionFromContext =async (context: {
  queryClient: QueryClient
}): Promise<Session | null> => {
  const session = await context.queryClient.ensureQueryData(
    sessionQueryDataConfiq,
  )
  return session?.session ?? null
}


export const getCurrentSessionUserFromContext = async (context: {
  queryClient: QueryClient
}): Promise<TExtendedUser | null> => {
  const session = await context.queryClient.ensureQueryData(
    sessionQueryDataConfiq,
  )
  return session?.user ?? null
}
