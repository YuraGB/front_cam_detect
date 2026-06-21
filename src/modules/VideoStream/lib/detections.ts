import { safeJsonParse } from '#/lib/asyncActionHandler'
import type { Detection } from '#/modules/VideoStream/lib/drawDetections'
import type { RtcDataMessage } from '#/types'
import { formatLatency, formatMetrics, formatTracks } from './detectionFns'
import { decodeRtcMessage, isFiniteNumber, parseDetection } from './utils'

export const parseRtcDataMessage = async (
  data: string | ArrayBuffer | Blob,
): Promise<RtcDataMessage | null> => {
  const rawMessage = await decodeRtcMessage(data)
  if (!rawMessage) {
    return null
  }

  const payload: Record<string, unknown> | null = safeJsonParse(rawMessage)

  if (!payload) {
    return null
  }

  if (payload.type === 'track_map') {
    // formatTracks returns a TrackMapMessage-like object but TS may widen payload.type to string;
    // cast to RtcDataMessage to satisfy the return type.
    return formatTracks(payload) as RtcDataMessage
  }

  if (payload.type === 'video_latency_sample') {
    return formatLatency(payload) as RtcDataMessage
  }

  if (payload.type === 'pipeline_metrics') {
    return formatMetrics(payload) as RtcDataMessage
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
}
