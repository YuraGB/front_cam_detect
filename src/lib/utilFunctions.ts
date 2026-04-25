import type { StreamType, StreamURL } from "#/constants";
import type { Detection } from "#/lib/drawDetections";
import { getStreamName } from "#/lib/getStreamName";

const textDecoder = new TextDecoder();
const frameContextCache = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();
const reportedFrameFormatIssues = new Set<string>();

type ParsedFrameMeta = {
  cameraId?: string;
  detections?: Detection[];
  timestamp?: number;
};

type ExtractedFramePayload = {
  meta: ParsedFrameMeta;
  imageBytes: ArrayBuffer;
  imageType: string;
};

type FrameParseDiagnostics = {
  metadataParsed: boolean;
  metadataLengthCandidates: number[];
  payloadByteLength: number;
  payloadHeaderHex: string;
  payloadHeaderText: string;
};

const IMAGE_SIGNATURES = [
  {
    type: "image/jpeg",
    matches: (bytes: Uint8Array) =>
      bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    type: "image/png",
    matches: (bytes: Uint8Array) =>
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  {
    type: "image/webp",
    matches: (bytes: Uint8Array) =>
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
] as const;

const detectImageType = (bytes: Uint8Array): string | null => {
  const match = IMAGE_SIGNATURES.find((signature) => signature.matches(bytes));
  return match?.type ?? null;
};

const decodeMetaCandidate = (metaBytes: Uint8Array): ParsedFrameMeta | null => {
  const start = metaBytes.indexOf(0x7b);
  const end = metaBytes.lastIndexOf(0x7d);
  if (start === -1 || end === -1 || end < start) {
    return null;
  }

  try {
    return JSON.parse(textDecoder.decode(metaBytes.slice(start, end + 1))) as ParsedFrameMeta;
  } catch {
    return null;
  }
};

const findImageStart = (bytes: Uint8Array): { offset: number; imageType: string } | null => {
  for (let offset = 0; offset < bytes.length; offset += 1) {
    const imageType = detectImageType(bytes.subarray(offset));
    if (imageType) {
      return { offset, imageType };
    }
  }

  return null;
};

const getHexPreview = (bytes: Uint8Array, maxLength: number = 32): string => {
  return Array.from(bytes.slice(0, maxLength), (byte) => byte.toString(16).padStart(2, "0")).join(" ");
};

const getTextPreview = (bytes: Uint8Array, maxLength: number = 160): string => {
  return textDecoder.decode(bytes.slice(0, maxLength)).replace(/[^\x20-\x7e]/g, ".");
};

const getPayloadDiagnostics = (
  buffer: ArrayBuffer,
  metadataLengthCandidates: number[]
): FrameParseDiagnostics => {
  const bytes = new Uint8Array(buffer);
  const payloadOffset = metadataLengthCandidates.find(
    (candidate) => candidate > 0 && 4 + candidate <= buffer.byteLength
  );

  const payloadBytes = payloadOffset ? bytes.subarray(4 + payloadOffset) : bytes.subarray(4);
  const metadataParsed = metadataLengthCandidates.some((candidate) => {
    if (candidate <= 0 || 4 + candidate > buffer.byteLength) {
      return false;
    }

    try {
      JSON.parse(textDecoder.decode(bytes.subarray(4, 4 + candidate)));
      return true;
    } catch {
      return false;
    }
  });

  return {
    metadataParsed,
    metadataLengthCandidates,
    payloadByteLength: payloadBytes.byteLength,
    payloadHeaderHex: getHexPreview(payloadBytes),
    payloadHeaderText: getTextPreview(payloadBytes),
  };
};

const reportFrameFormatIssue = (
  debugLabel: string,
  byteLength: number,
  diagnostics: FrameParseDiagnostics
) => {
  const issueKey = `${debugLabel}:${byteLength}:${diagnostics.payloadHeaderHex}`;
  if (reportedFrameFormatIssues.has(issueKey)) {
    return;
  }

  reportedFrameFormatIssues.add(issueKey);
  const logMethod = diagnostics.metadataParsed ? console.warn : console.error;
  logMethod("Unsupported frame payload format", {
    stream: debugLabel,
    byteLength,
    ...diagnostics,
  });
};

const tryExtractFramePayload = (
  buffer: ArrayBuffer,
  includeImageBytes: boolean,
  littleEndian: boolean
): ExtractedFramePayload | null => {
  if (buffer.byteLength < 4) {
    return null;
  }

  const view = new DataView(buffer);
  const metaLength = view.getUint32(0, littleEndian);
  if (metaLength <= 0 || 4 + metaLength > buffer.byteLength) {
    return null;
  }

  const metaBytes = buffer.slice(4, 4 + metaLength);
  const imageBytes = includeImageBytes ? buffer.slice(4 + metaLength) : new ArrayBuffer(0);

  try {
    const meta = JSON.parse(textDecoder.decode(metaBytes)) as ParsedFrameMeta;
    if (!includeImageBytes) {
      return {
        meta,
        imageBytes,
        imageType: "image/jpeg",
      };
    }

    const imageType = detectImageType(new Uint8Array(imageBytes));
    if (!imageType) {
      return null;
    }

    return {
      meta,
      imageBytes,
      imageType,
    };
  } catch {
    return null;
  }
};

const tryExtractFramePayloadBySignature = (
  buffer: ArrayBuffer,
  includeImageBytes: boolean
): ExtractedFramePayload | null => {
  const bytes = new Uint8Array(buffer);
  const imageStart = findImageStart(bytes);
  if (!imageStart) {
    return null;
  }

  const meta =
    decodeMetaCandidate(bytes.subarray(4, imageStart.offset)) ??
    decodeMetaCandidate(bytes.subarray(0, imageStart.offset));
  if (!meta) {
    return null;
  }

  return {
    meta,
    imageBytes: includeImageBytes ? buffer.slice(imageStart.offset) : new ArrayBuffer(0),
    imageType: imageStart.imageType,
  };
};

/**
 * Creates a WebSocket connection for the given stream URL and returns the socket along with its stream name.
 * @param streamUrl 
 * @returns 
 */
const createSocket = (streamUrl: StreamURL): { socket: WebSocket; streamName: StreamType } => {
    const streamName = getStreamName(streamUrl);
    const socket = new WebSocket(streamUrl);

    return {
        socket,
        streamName
    }
}

/**
 * Draws a video frame onto the given canvas using the provided image bytes.
 * @param canvas 
 * @param imageBytes 
 * @returns 
 */
async function drawFrame(canvas: HTMLCanvasElement, imageBytes: ArrayBuffer, imageType: string) {
  let ctx = frameContextCache.get(canvas);
  if (!ctx) {
    const created = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
    if (!created) return;
    frameContextCache.set(canvas, created);
    ctx = created;
  }
  const blob = new Blob([imageBytes], { type: imageType });
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob, {
      colorSpaceConversion: "none",
      premultiplyAlpha: "none",
    });
  } catch {
    bitmap = await createImageBitmap(blob);
  }
  const width = bitmap.width;
  const height = bitmap.height;

  // Keep the canvas in source resolution for native-like sharpness and lower scaling cost.
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return {
    width,
    height
  }
}

/**
 * Formats the incoming ArrayBuffer data from the WebSocket message to extract the camera ID and image bytes.
 * @param param0 
 * @returns 
 */
function formatBufferData(
  { data }: { data: ArrayBuffer },
  options?: { includeImageBytes?: boolean; debugLabel?: string }
): { cameraId: string; imageBytes: ArrayBuffer; detections: Detection[]; timestamp: number | null; imageType: string } {
            const includeImageBytes = options?.includeImageBytes ?? true;
            const debugLabel = options?.debugLabel ?? "frame";
            if (!(data instanceof ArrayBuffer)) {
                console.error("data is not an ArrayBuffer", data);
                return { cameraId: "", imageBytes: new ArrayBuffer(0), detections: [], timestamp: null, imageType: "image/jpeg" };
            }
            const buffer = data;
            if (buffer.byteLength < 4) {
              console.error("Message is too short to contain metadata length");
              return { cameraId: "", imageBytes: new ArrayBuffer(0), detections: [], timestamp: null, imageType: "image/jpeg" };
            }

            const view = new DataView(buffer);
            const metadataLengthCandidates = [view.getUint32(0, false), view.getUint32(0, true)];

            const extractedPayload =
              tryExtractFramePayload(buffer, includeImageBytes, false) ??
              tryExtractFramePayload(buffer, includeImageBytes, true) ??
              tryExtractFramePayloadBySignature(buffer, includeImageBytes);

            if (!extractedPayload) {
              const diagnostics = getPayloadDiagnostics(buffer, metadataLengthCandidates);
              reportFrameFormatIssue(debugLabel, buffer.byteLength, diagnostics);
              return { cameraId: "", imageBytes: new ArrayBuffer(0), detections: [], timestamp: null, imageType: "image/jpeg" };
            }

            const { meta, imageBytes, imageType } = extractedPayload;

            return {
              cameraId: meta.cameraId ?? "",
              detections: Array.isArray(meta.detections) ? meta.detections : [],
              timestamp: typeof meta.timestamp === "number" ? meta.timestamp : null,
              imageBytes,
              imageType,
            };
}


export {
    formatBufferData,
    drawFrame,
    createSocket
}
