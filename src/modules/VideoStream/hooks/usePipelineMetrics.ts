import type { InferencePipelineMetricsMessage, PipelineMetricsMessage, VideoPipelineMetricsMessage } from '#/types'
import { useCallback, useState } from 'react'

export type PipelineMetricsState = {
  video: Partial<
    Record<string, VideoPipelineMetricsMessage & { updatedAt: number }>
  >
  inference: (InferencePipelineMetricsMessage & { updatedAt: number }) | null
}

export const usePipelineMetrics = () => {
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetricsState>({
    video: {},
    inference: null,
  })

  const recordPipelineMetrics = useCallback(
    (message: PipelineMetricsMessage) => {
      const updatedAt = Date.now()

      if (message.scope === 'video') {
        setPipelineMetrics((prev) => ({
          ...prev,
          video: {
            ...prev.video,
            [message.cameraId]: {
              ...message,
              updatedAt,
            },
          },
        }))
        return
      }

      setPipelineMetrics((prev) => ({
        ...prev,
        inference: {
          ...message,
          updatedAt,
        },
      }))
    },
    [],
  )

  return {
    pipelineMetrics,
    recordPipelineMetrics,
  }
}
