import type { ErrorComponentProps } from '@tanstack/react-router'

export const ErrorComponent = ({ error }: ErrorComponentProps) => {
  if (error.message === 'Forbidden') {
    return <div>Access denied</div>
  }

  return <div>Something went wrong</div>
}
