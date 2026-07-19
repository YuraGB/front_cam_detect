import { getUserByEmail } from '#/server/modules/services/User'
import { createServerFn } from '@tanstack/react-start'
import { safeJsonParse } from './asyncActionHandler'
import { queryOptions } from 'node_modules/@tanstack/react-query/build/modern/_tsup-dts-rollup'

export const getPermissionsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { email: string }) => data)
  .handler(getPermissionsHandler)

export const permissionsQueryDataConfig = (email: string) =>
  queryOptions({
    queryKey: ['permissions', email],
    queryFn: () => getPermissionsFn({ data: { email } }),
    staleTime: 60_000,
    gcTime: Infinity,
  })

async function getPermissionsHandler({
  data,
}: { data?: { email: string } } = {}): Promise<any | null> {
  const email = data?.email
  if (!email) return null

  const user = await getUserByEmail(email)
  if (!user) return null
  return safeJsonParse(user.permissionsJson)
}
