const STREAM_TYPES = ['liveStream', 'detectionStream', 'fileFrames'] as const
const STREAM_URLS =  [
  'ws://localhost:3002/ws?type=liveStream',
  'ws://localhost:3002/ws?type=detectionStream',
  'ws://localhost:3002/ws/file-frames',
] as const

export type StreamType = typeof STREAM_TYPES[number];
export type StreamURL = typeof STREAM_URLS[number];

export type VideoResources = Partial<Record<string, Partial<Record<StreamType, HTMLCanvasElement>>>>;

export { STREAM_TYPES, STREAM_URLS}
