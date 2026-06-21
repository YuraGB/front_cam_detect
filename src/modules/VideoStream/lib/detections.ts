import { safeJsonParse } from '#/lib/asyncActionHandler'
import type { RtcDataMessage } from '#/types'
import {
  formatDetections,
  formatLatency,
  formatMetrics,
  formatTracks,
} from './detectionFns'
import { decodeRtcMessage } from './utils'

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

  switch (payload.type) {
    case 'track_map':
      return formatTracks(payload) as RtcDataMessage
    case 'video_latency_sample':
      return formatLatency(payload) as RtcDataMessage
    case 'pipeline_metrics':
      return formatMetrics(payload) as RtcDataMessage
    default: {
      if (typeof payload.camera_id !== 'string') {
        return null
      }
      return formatDetections(payload) as RtcDataMessage
    }
  }
}
