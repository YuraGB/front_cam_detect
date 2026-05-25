import type { StreamType } from '#/constants'
import type { Detection } from '#/modules/VideoStream/lib/drawDetections'
import type { StreamConnectionControl, StreamHealth } from '#/types'

const createStreamControl = (): StreamConnectionControl => ({
  ws: null,
  reconnectTimer: null,
  heartbeatTimer: null,
  reconnectAttempt: 0,
  lastMessageAt: 0,
  isRegistered: false,
  connectRequested: false,
  peerId: null,
})

const getStablePeerId = (streamName: StreamType): string => {
  const storageKey = `cam-frontend-peer-id:${streamName}`
  try {
    const existing = window.sessionStorage.getItem(storageKey)
    if (existing) {
      return existing
    }

    const generated = `frontend-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(storageKey, generated)
    return generated
  } catch {
    return `frontend-${Math.random().toString(36).slice(2)}`
  }
}

const emptyConnectionState: Record<StreamType, StreamHealth> = {
  liveStream: 'disconnected',
  detectionStream: 'disconnected',
  fileFrames: 'disconnected',
  webrtc: 'disconnected',
}

const textDecoder = new TextDecoder()

const toDisplayEpochMs = (now: DOMHighResTimeStamp): number =>
  performance.timeOrigin + now

const calculateLatencyMs = (
  displayTimestampMs: number,
  captureTimestampMs: number,
): number => Math.max(0, Math.round(displayTimestampMs - captureTimestampMs))

const formatNumber = (value: number, digits = 1): string =>
  value.toFixed(digits)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const parseDetection = (value: unknown): Detection | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Record<string, unknown>
  const bbox = candidate.bbox
  if (!bbox || typeof bbox !== 'object') {
    return null
  }

  const bboxRecord = bbox as Record<string, unknown>
  const x = bboxRecord.x
  const y = bboxRecord.y
  const width = bboxRecord.width
  const height = bboxRecord.height
  const label = candidate.label
  const confidence = candidate.confidence

  if (
    !isFiniteNumber(x) ||
    !isFiniteNumber(y) ||
    !isFiniteNumber(width) ||
    !isFiniteNumber(height) ||
    typeof label !== 'string' ||
    !isFiniteNumber(confidence)
  ) {
    return null
  }

  return {
    bbox: { x, y, width, height },
    label,
    confidence,
  }
}

const decodeRtcMessage = async (
  data: string | ArrayBuffer | Blob,
): Promise<string | null> => {
  if (typeof data === 'string') {
    return data
  }

  if (data instanceof ArrayBuffer) {
    return textDecoder.decode(data)
  }

  if (data instanceof Blob) {
    return data.text()
  }

  return null
}

export {
  createStreamControl,
  getStablePeerId,
  emptyConnectionState,
  toDisplayEpochMs,
  calculateLatencyMs,
  formatNumber,
  isFiniteNumber,
  parseDetection,
  decodeRtcMessage,
  textDecoder,
}
