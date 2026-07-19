import { sessionQueryDataConfiq } from '#/lib/getCurrentSessionFromContext'
import { useQuery } from '@tanstack/react-query'

export const useCurrentSession = () => {
  return useQuery(sessionQueryDataConfiq)
}
