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


type WebRtcMessage = OfferMessage | AnswerMessage | IceCandidateMessage;


export type { StreamHealth, StreamMetric, StreamMetricMutable, StreamConnectionControl, WebRtcMessage };