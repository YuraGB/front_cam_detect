import { useQuery } from '@tanstack/react-query'
import { sessionQueryDataConfiq } from './useAuthCache'

export const useCurrentSession = () => {
  return useQuery(sessionQueryDataConfiq)
}
