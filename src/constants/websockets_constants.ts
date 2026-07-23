import { SIGNALING_SERVER_URL_WS } from './webrtc_constants'

const HEARTBEAT_INTERVAL_MS = 5000
const STREAM_INACTIVITY_TIMEOUT_MS = 60000 // 1 minute;
const RECONNECT_BASE_DELAY_MS = 500
const RECONNECT_MAX_DELAY_MS = 10000
const OFFER_RETRY_DELAY_MS = 1000
const DETECTION_STALE_TIMEOUT_MS = 1500

const STREAM_TYPES = [
  'liveStream',
  'detectionStream',
  'fileFrames',
  'webrtc',
] as const

const STREAM_URLS = [SIGNALING_SERVER_URL_WS] as const
export type StreamType = (typeof STREAM_TYPES)[number]
export type StreamURL = (typeof STREAM_URLS)[number]

export {
  RECONNECT_BASE_DELAY_MS,
  DETECTION_STALE_TIMEOUT_MS,
  HEARTBEAT_INTERVAL_MS,
  OFFER_RETRY_DELAY_MS,
  RECONNECT_MAX_DELAY_MS,
  STREAM_INACTIVITY_TIMEOUT_MS,
  STREAM_URLS,
}
