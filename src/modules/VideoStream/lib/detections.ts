import type { Detection } from '#/lib/drawDetections'
import type { RtcDataMessage, TrackMapEntry } from '#/types'
import { decodeRtcMessage, isFiniteNumber, parseDetection } from './utils'

export const parseRtcDataMessage = async (
  data: string | ArrayBuffer | Blob,
): Promise<RtcDataMessage | null> => {
  const rawMessage = await decodeRtcMessage(data)
  if (!rawMessage) {
    return null
  }

  try {
    const payload = JSON.parse(rawMessage) as Record<string, unknown>

    if (payload.type === 'track_map') {
      const tracks = Array.isArray(payload.tracks)
        ? payload.tracks
            .map((track) => {
              if (!track || typeof track !== 'object') {
                return null
              }

              const candidate = track as Record<string, unknown>
              return typeof candidate.mid === 'string' &&
                typeof candidate.camera_id === 'string'
                ? { mid: candidate.mid, cameraId: candidate.camera_id }
                : null
            })
            .filter((track): track is TrackMapEntry => track !== null)
        : []

      return {
        type: 'track_map',
        tracks,
      }
    }

    if (payload.type === 'video_latency_sample') {
      if (
        typeof payload.camera_id !== 'string' ||
        !isFiniteNumber(payload.frame_id) ||
        !isFiniteNumber(payload.capture_timestamp_ms) ||
        !isFiniteNumber(payload.encoded_timestamp_ms)
      ) {
        return null
      }

      return {
        type: 'video_latency_sample',
        cameraId: payload.camera_id,
        frameId: payload.frame_id,
        captureTimestampMs: payload.capture_timestamp_ms,
        encodedTimestampMs: payload.encoded_timestamp_ms,
        sampleIntervalMs: isFiniteNumber(payload.sample_interval_ms)
          ? payload.sample_interval_ms
          : null,
      }
    }

    if (payload.type === 'pipeline_metrics') {
      if (payload.scope === 'video') {
        if (
          typeof payload.camera_id !== 'string' ||
          !isFiniteNumber(payload.interval_ms) ||
          !isFiniteNumber(payload.capture_fps) ||
          !isFiniteNumber(payload.encode_fps) ||
          !isFiniteNumber(payload.avg_capture_delay_ms) ||
          !isFiniteNumber(payload.max_capture_delay_ms) ||
          !isFiniteNumber(payload.avg_h264_encode_ms) ||
          !isFiniteNumber(payload.max_h264_encode_ms) ||
          !isFiniteNumber(payload.dropped_stale_frames) ||
          !isFiniteNumber(payload.total_dropped_stale_frames) ||
          !isFiniteNumber(payload.estimated_live_fps)
        ) {
          return null
        }

        return {
          type: 'pipeline_metrics',
          scope: 'video',
          cameraId: payload.camera_id,
          intervalMs: payload.interval_ms,
          captureFps: payload.capture_fps,
          encodeFps: payload.encode_fps,
          avgCaptureDelayMs: payload.avg_capture_delay_ms,
          maxCaptureDelayMs: payload.max_capture_delay_ms,
          avgH264EncodeMs: payload.avg_h264_encode_ms,
          maxH264EncodeMs: payload.max_h264_encode_ms,
          droppedStaleFrames: payload.dropped_stale_frames,
          totalDroppedStaleFrames: payload.total_dropped_stale_frames,
          estimatedLiveFps: payload.estimated_live_fps,
        }
      }

      if (payload.scope === 'inference') {
        if (
          !isFiniteNumber(payload.interval_ms) ||
          !isFiniteNumber(payload.submitted_frames) ||
          !isFiniteNumber(payload.dropped_pending_frames) ||
          !isFiniteNumber(payload.processed_frames) ||
          !isFiniteNumber(payload.total_detections) ||
          !isFiniteNumber(payload.avg_inference_ms) ||
          !isFiniteNumber(payload.max_inference_ms)
        ) {
          return null
        }

        return {
          type: 'pipeline_metrics',
          scope: 'inference',
          intervalMs: payload.interval_ms,
          submittedFrames: payload.submitted_frames,
          droppedPendingFrames: payload.dropped_pending_frames,
          processedFrames: payload.processed_frames,
          totalDetections: payload.total_detections,
          avgInferenceMs: payload.avg_inference_ms,
          maxInferenceMs: payload.max_inference_ms,
        }
      }

      return null
    }

    if (typeof payload.camera_id !== 'string') {
      return null
    }

    const detections = Array.isArray(payload.detections)
      ? payload.detections
          .map(parseDetection)
          .filter((detection): detection is Detection => detection !== null)
      : []

    return {
      type: 'detection_frame',
      cameraId: payload.camera_id,
      detections,
      timestamp: isFiniteNumber(payload.timestamp) ? payload.timestamp : null,
    }
  } catch {
    return null
  }
}
