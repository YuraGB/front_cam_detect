import type { LatencyBadgeProps } from '#/types'
import { memo } from 'react'

export const LatencyBadge = memo(({ latencyMs }: LatencyBadgeProps) => (
  <span style={{ fontVariantNumeric: 'tabular-nums' }}>
    latency: {latencyMs == null ? 'waiti   ng...' : `${latencyMs} ms`}
  </span>
))

LatencyBadge.displayName = 'LatencyBadge'
