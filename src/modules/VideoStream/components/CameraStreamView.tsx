import { memo, useCallback } from 'react'
import { LatencyBadge } from './LatencyBadge'
import { PipelineMetricsPanel } from './PipelineMetricsPanel'
import type { CameraStreamViewProps } from '#/types'
import { Switch } from '#/components/ui/switch'

export const CameraStreamView = memo(
  ({
    cameraId,
    latencyMs,
    videoMetrics,
    inferenceMetrics,
    registerVideoElement,
    registerOverlayCanvas,
    shouldDrawOverlay,
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
          <div className="flex space-x-2">
            <Switch
              id="show_detection_overlay"
              onCheckedChange={(isChecked) =>
                shouldDrawOverlay(cameraId, isChecked)
              }
            />
            <label htmlFor="show_detection_overlay">Airplane Mode</label>
          </div>
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
