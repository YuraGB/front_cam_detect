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


export type { StreamHealth, StreamMetric, StreamMetricMutable, StreamConnectionControl, WebRtcMessage, CameraBinding, UsePcResult  };
