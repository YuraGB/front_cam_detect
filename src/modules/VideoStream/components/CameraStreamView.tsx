import { memo, useCallback } from 'react'
import { LatencyBadge } from './LatencyBadge'
import { PipelineMetricsPanel } from './PipelineMetricsPanel'
import type { CameraStreamViewProps } from '#/types'

export const CameraStreamView = memo(
  ({
    cameraId,
    latencyMs,
    videoMetrics,
    inferenceMetrics,
    registerVideoElement,
    registerOverlayCanvas,
  }: CameraStreamViewProps) => {
    const videoRef = useCallback(
      (element: HTMLVideoElement | null) => {
        registerVideoElement(cameraId, element)
      },
      [cameraId, registerVideoElement],
    )

    const canvasRef = useCallback(
      (element: HTMLCanvasElement | null) => {
        registerOverlayCanvas(cameraId, element)
      },
      [cameraId, registerOverlayCanvas],
    )

    return (
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>{cameraId}</h2>
          <LatencyBadge latencyMs={latencyMs} />
        </div>
        <div
          style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            controls
            style={{
              width: '100%',
              display: 'block',
              background: '#000',
              position: 'relative',
              zIndex: 0,
            }}
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </div>
        <PipelineMetricsPanel
          videoMetrics={videoMetrics}
          inferenceMetrics={inferenceMetrics}
        />
      </section>
    )
  },
)

CameraStreamView.displayName = 'CameraStreamView'
