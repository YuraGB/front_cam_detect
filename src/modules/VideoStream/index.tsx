import { useStreams } from './hooks/useStreams'
import { CameraStreamView } from './components/CameraStreamView'

export const VideoStream = () => {
  const {
    cameraIds,
    latencyMetrics,
    pipelineMetrics,
    registerVideoElement,
    registerOverlayCanvas,
  } = useStreams()

  return (
    <div>
      <h1>Video Streams</h1>
      <div style={{ display: 'grid', gap: 24 }}>
        {cameraIds.map((cameraId: string) => (
          <CameraStreamView
            key={cameraId}
            cameraId={cameraId}
            latencyMs={latencyMetrics[cameraId]?.latencyMs}
            videoMetrics={pipelineMetrics.video[cameraId]}
            inferenceMetrics={pipelineMetrics.inference}
            registerVideoElement={registerVideoElement}
            registerOverlayCanvas={registerOverlayCanvas}
          />
        ))}
      </div>
    </div>
  )
}
