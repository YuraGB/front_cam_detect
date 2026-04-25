const STREAM_TYPES = ['liveStream', 'detectionStream', 'fileFrames', 'webrtc'] as const
const STREAM_URLS =  [
  // 'ws://localhost:3002/ws?type=liveStream',
  // 'ws://localhost:3002/ws?type=detectionStream',
  // 'ws://localhost:3002/ws/file-frames',
  // 'ws://localhost:3001/ws?type=webrtc',
  'ws://127.0.0.1:3001/ws?type=webrtc',
] as const

export type StreamType = typeof STREAM_TYPES[number];
export type StreamURL = typeof STREAM_URLS[number];

export type VideoResources = Partial<Record<string, Partial<Record<StreamType, HTMLCanvasElement>>>>;

export { STREAM_TYPES, STREAM_URLS}


const HEARTBEAT_INTERVAL_MS = 5000;
const STREAM_INACTIVITY_TIMEOUT_MS = 60000 // 1 minute;
const RECONNECT_BASE_DELAY_MS = 500;
const RECONNECT_MAX_DELAY_MS = 10000;
const STATS_PUBLISH_INTERVAL_MS = 500;

const DETECTION_STALE_TIMEOUT_MS = 250;

export {
  HEARTBEAT_INTERVAL_MS,
  STREAM_INACTIVITY_TIMEOUT_MS,
  RECONNECT_BASE_DELAY_MS,
  RECONNECT_MAX_DELAY_MS,
  STATS_PUBLISH_INTERVAL_MS,
  DETECTION_STALE_TIMEOUT_MS,
}