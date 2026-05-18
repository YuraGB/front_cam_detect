import { memo } from 'react'

type LatencyBadgeProps = {
  latencyMs?: number
}

export const LatencyBadge = memo(({ latencyMs }: LatencyBadgeProps) => (
  <span style={{ fontVariantNumeric: 'tabular-nums' }}>
    latency: {latencyMs == null ? 'waiting...' : `${latencyMs} ms`}
  </span>
))

LatencyBadge.displayName = 'LatencyBadge'
