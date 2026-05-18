import type { PipelineMetricsPanelProps } from '#/types'
import { memo } from 'react'
import { formatNumber } from '../lib/utils'

export const PipelineMetricsPanel = memo(
  ({ videoMetrics, inferenceMetrics }: PipelineMetricsPanelProps) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 8,
        marginTop: 8,
        fontSize: 13,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span>
        capture fps:{' '}
        {videoMetrics ? formatNumber(videoMetrics.captureFps) : '...'}
      </span>
      <span>
        capture delay:{' '}
        {videoMetrics
          ? `${formatNumber(videoMetrics.avgCaptureDelayMs)} ms`
          : '...'}
      </span>
      <span>
        encode:{' '}
        {videoMetrics
          ? `${formatNumber(videoMetrics.avgH264EncodeMs)} ms`
          : '...'}
      </span>
      <span>
        dropped: {videoMetrics ? videoMetrics.totalDroppedStaleFrames : '...'}
      </span>
      <span>
        yolo:{' '}
        {inferenceMetrics
          ? `${formatNumber(inferenceMetrics.avgInferenceMs)} ms`
          : '...'}
      </span>
      <span>
        yolo frames:{' '}
        {inferenceMetrics ? inferenceMetrics.processedFrames : '...'}
      </span>
      <span>
        yolo skipped:{' '}
        {inferenceMetrics ? inferenceMetrics.droppedPendingFrames : '...'}
      </span>
    </div>
  ),
)

PipelineMetricsPanel.displayName = 'PipelineMetricsPanel'
