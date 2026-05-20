import type { Detection } from "#/lib/drawDetections";

type StreamHealth = "connecting" | "connected" | "reconnecting" | "stalled" | "disconnected";

type StreamMetric = {
  fps: number;
  rendered: number;
  dropped: number;
  decodeMs: number;
  latencyMs: number | null;
};

type StreamMetricMutable = StreamMetric & {
  lastRenderedAt: number;
};

type VideoLatencyMetric = {
  latencyMs: number;
  captureTimestampMs: number;
  encodedTimestampMs: number;
  displayTimestampMs: number;
  frameId: number;
  updatedAt: number;
};

type ScheduledFrameCallback = {
  type: "video-frame" | "animation-frame";
  handle: number;
};

type StreamConnectionControl = {
  ws: WebSocket | null;
  reconnectTimer: number | null;
  heartbeatTimer: number | null;
  reconnectAttempt: number;
  lastMessageAt: number;
  isRegistered: boolean;
  connectRequested: boolean;
  peerId: string | null;
};

interface OfferMessage {
    type: "offer";
    sdp: string;
    peerId: string;
}

interface AnswerMessage {
    type: "answer";
    sdp: string;
}

interface IceCandidateMessage {
    type: "ice-candidate";
    candidate: string;
    mid: string;
}

interface RegisteredMessage {
    type: "registered";
    peerId: string;
}

interface SignalingErrorMessage {
    type: "error";
    code?: string;
    message?: string;
}

type WebRtcMessage = OfferMessage | AnswerMessage | IceCandidateMessage | RegisteredMessage | SignalingErrorMessage;
type CameraBinding = {
  stream: MediaStream;
  video: HTMLVideoElement | null;
  canvas: HTMLCanvasElement | null;
  layoutHandler: (() => void) | null;
};

type UsePcResult = {
  pc: RTCPeerConnection | null;
  cameraIds: string[];
  latencyMetrics: Partial<Record<string, { latencyMs: number; updatedAt: number }>>;
  registerVideoElement: (cameraId: string, element: HTMLVideoElement | null) => void;
  registerOverlayCanvas: (cameraId: string, element: HTMLCanvasElement | null) => void;
};
type ScheduledOverlayDraw = {
  type: "video-frame" | "animation-frame";
  handle: number;
};

type VideoMetrics = {
  captureFps: number;
  encodeFps: number;
  avgCaptureDelayMs: number;
  avgH264EncodeMs: number;
  droppedStaleFrames: number;
  totalDroppedStaleFrames: number;
};

type InferenceMetrics = {
  submittedFrames: number;
  droppedPendingFrames: number;
  processedFrames: number;
  avgInferenceMs: number;
  maxInferenceMs: number;
};

type PipelineMetricsPanelProps = {
  videoMetrics?: VideoMetrics;
  inferenceMetrics: InferenceMetrics | null;
};

export type DetectionFrameMessage = {
  type: 'detection_frame'
  cameraId: string
  detections: Detection[]
  timestamp: number | null
}

export type TrackMapEntry = {
  mid: string
  cameraId: string
}

export type TrackMapMessage = {
  type: 'track_map'
  tracks: TrackMapEntry[]
}

export type VideoLatencySampleMessage = {
  type: 'video_latency_sample'
  cameraId: string
  frameId: number
  captureTimestampMs: number
  encodedTimestampMs: number
  sampleIntervalMs: number | null
}

export type VideoPipelineMetricsMessage = {
  type: 'pipeline_metrics'
  scope: 'video'
  cameraId: string
  intervalMs: number
  captureFps: number
  encodeFps: number
  avgCaptureDelayMs: number
  maxCaptureDelayMs: number
  avgH264EncodeMs: number
  maxH264EncodeMs: number
  droppedStaleFrames: number
  totalDroppedStaleFrames: number
  estimatedLiveFps: number
}

export type InferencePipelineMetricsMessage = {
  type: 'pipeline_metrics'
  scope: 'inference'
  intervalMs: number
  submittedFrames: number
  droppedPendingFrames: number
  processedFrames: number
  totalDetections: number
  avgInferenceMs: number
  maxInferenceMs: number
}

export type PipelineMetricsMessage =
  | VideoPipelineMetricsMessage
  | InferencePipelineMetricsMessage

export type RtcDataMessage =
  | DetectionFrameMessage
  | TrackMapMessage
  | VideoLatencySampleMessage
  | PipelineMetricsMessage



export type { 
  StreamHealth, 
  StreamMetric,
   StreamMetricMutable, 
   StreamConnectionControl,
    WebRtcMessage, 
    CameraBinding, 
    UsePcResult,
     VideoLatencyMetric, 
     ScheduledFrameCallback, 
     ScheduledOverlayDraw,
      VideoMetrics,
       InferenceMetrics, 
       PipelineMetricsPanelProps 
      };
