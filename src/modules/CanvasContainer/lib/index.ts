import type { StreamType, StreamURL } from "#/constants";
import type { Detection } from "#/lib/drawDetections";
import { getStreamName } from "#/lib/getStreamName";

const textDecoder = new TextDecoder();
const frameContextCache = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();

/**
 * Creates a WebSocket connection for the given stream URL and returns the socket along with its stream name.
 * @param streamUrl 
 * @returns 
 */
const createSocket = (streamUrl: StreamURL): { socket: WebSocket; streamName: StreamType } => {
    const streamName = getStreamName(streamUrl);
    const socket = new WebSocket(streamUrl);
    
    socket.onopen = () => {
        console.log(`WebSocket connected for ${streamName}`);
    };
    
    socket.onclose = () => {
        console.log(`WebSocket disconnected for ${streamName}`);
    };

    socket.onerror = (error) => {
        console.error(`WebSocket error for ${streamName}`, error);
    };

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
async function drawFrame(canvas: HTMLCanvasElement, imageBytes: ArrayBuffer) {
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
  const blob = new Blob([imageBytes], { type: "image/jpeg" });
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
  options?: { includeImageBytes?: boolean }
): { cameraId: string; imageBytes: ArrayBuffer; detections: Detection[]; timestamp: number | null } {
            const includeImageBytes = options?.includeImageBytes ?? true;
            if (!(data instanceof ArrayBuffer)) {
                console.error("data is not an ArrayBuffer", data);
                return { cameraId: "", imageBytes: new ArrayBuffer(0), detections: [], timestamp: null };
            }
            const buffer = data;
            if (buffer.byteLength < 4) {
              console.error("Message is too short to contain metadata length");
              return { cameraId: "", imageBytes: new ArrayBuffer(0), detections: [], timestamp: null };
            }

            const view = new DataView(buffer);
            const metaLength = view.getUint32(0);
            if (metaLength <= 0 || 4 + metaLength > buffer.byteLength) {
              console.error("Invalid metadata length", metaLength);
              return { cameraId: "", imageBytes: new ArrayBuffer(0), detections: [], timestamp: null };
            }
            const metaBytes = buffer.slice(4, 4 + metaLength);
            const imageBytes = includeImageBytes ? buffer.slice(4 + metaLength) : new ArrayBuffer(0);

            /**
             * Expecting metaBytes to contain a JSON string with a structure like:
             * meta:
             * {
             *   "cameraId": "camera_1",
             *   frameId: "frame_12345",
             *   timestamp: 1690000000000
             *   detections: [
             *      {
             *          bbox: { x: 10, y: 20, width: 100, height: 50 },
             *          label: "person",
             *          confidence: 0.95
             *      },
             *      ...
             *  ] | []  
             * }
             */
            try {
              const meta = JSON.parse(textDecoder.decode(metaBytes)) as {
                cameraId?: string;
                detections?: Detection[];
                timestamp?: number;
              };

              return {
                cameraId: meta.cameraId ?? "",
                detections: Array.isArray(meta.detections) ? meta.detections : [],
                timestamp: typeof meta.timestamp === "number" ? meta.timestamp : null,
                imageBytes,
              };
            } catch (error) {
              console.error("Failed to parse frame metadata", error);
              return { cameraId: "", imageBytes: new ArrayBuffer(0), detections: [], timestamp: null };
            }
}


export {
    formatBufferData,
    drawFrame,
    createSocket
}
