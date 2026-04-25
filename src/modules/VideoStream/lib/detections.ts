import type { Detection } from "#/lib/drawDetections";

export type DetectionFrameMessage = {
  type: "detection_frame";
  cameraId: string;
  detections: Detection[];
  timestamp: number | null;
};

export type TrackMapEntry = {
  mid: string;
  cameraId: string;
};

export type TrackMapMessage = {
  type: "track_map";
  tracks: TrackMapEntry[];
};

export type RtcDataMessage = DetectionFrameMessage | TrackMapMessage;

const textDecoder = new TextDecoder();

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const parseDetection = (value: unknown): Detection | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const bbox = candidate.bbox;
  if (!bbox || typeof bbox !== "object") {
    return null;
  }

  const bboxRecord = bbox as Record<string, unknown>;
  const x = bboxRecord.x;
  const y = bboxRecord.y;
  const width = bboxRecord.width;
  const height = bboxRecord.height;
  const label = candidate.label;
  const confidence = candidate.confidence;

  if (
    !isFiniteNumber(x) ||
    !isFiniteNumber(y) ||
    !isFiniteNumber(width) ||
    !isFiniteNumber(height) ||
    typeof label !== "string" ||
    !isFiniteNumber(confidence)
  ) {
    return null;
  }

  return {
    bbox: { x, y, width, height },
    label,
    confidence,
  };
};

const decodeRtcMessage = async (data: string | ArrayBuffer | Blob): Promise<string | null> => {
  if (typeof data === "string") {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return textDecoder.decode(data);
  }

  if (data instanceof Blob) {
    return data.text();
  }

  return null;
};

export const parseRtcDataMessage = async (
  data: string | ArrayBuffer | Blob
): Promise<RtcDataMessage | null> => {
  const rawMessage = await decodeRtcMessage(data);
  if (!rawMessage) {
    return null;
  }

  try {
    const payload = JSON.parse(rawMessage) as Record<string, unknown>;

    if (payload.type === "track_map") {
      const tracks = Array.isArray(payload.tracks)
        ? payload.tracks
            .map((track) => {
              if (!track || typeof track !== "object") {
                return null;
              }

              const candidate = track as Record<string, unknown>;
              return typeof candidate.mid === "string" && typeof candidate.camera_id === "string"
                ? { mid: candidate.mid, cameraId: candidate.camera_id }
                : null;
            })
            .filter((track): track is TrackMapEntry => track !== null)
        : [];

      return {
        type: "track_map",
        tracks,
      };
    }

    if (typeof payload.camera_id !== "string") {
      return null;
    }

    const detections = Array.isArray(payload.detections)
      ? payload.detections.map(parseDetection).filter((detection): detection is Detection => detection !== null)
      : [];

    return {
      type: "detection_frame",
      cameraId: payload.camera_id,
      detections,
      timestamp: isFiniteNumber(payload.timestamp) ? payload.timestamp : null,
    };
  } catch {
    return null;
  }
};
