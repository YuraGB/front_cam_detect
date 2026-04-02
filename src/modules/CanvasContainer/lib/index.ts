import type { StreamType, StreamURL, VideoResources } from "#/constants";
import type { Detection } from "#/lib/drawDetections";
import { getStreamName } from "#/lib/getStreamName";

/**
 * Creates a WebSocket connection for the given stream URL and returns the socket along with its stream name.
 * @param streamUrl 
 * @returns 
 */
const createSocket = (streamUrl: StreamURL): { socket: WebSocket; streamName: StreamType } => {
    const streamName = getStreamName(streamUrl);

    if (!streamName) {
        console.error(`Invalid stream type: ${streamUrl}`);
        return { socket: null as unknown as WebSocket, streamName: null as unknown as StreamType };
    }

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
  const ctx = canvas.getContext("2d");
  console.log('Live stream context:', ctx);
  if (!ctx) return;

  const blob = new Blob([imageBytes], { type: "image/jpeg" });
  const bitmap = await createImageBitmap(blob);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
}

/**
 * Formats the incoming ArrayBuffer data from the WebSocket message to extract the camera ID and image bytes.
 * @param param0 
 * @returns 
 */
function formatBufferData ({data}: {data: ArrayBuffer}): { cameraId: string, imageBytes: ArrayBuffer, detections: Detection[] } {
            if (!(data instanceof ArrayBuffer)) {
                console.error("data is not an ArrayBuffer", data);
                return { cameraId: "", imageBytes: new ArrayBuffer(0), detections: [] };
            }
            const buffer = data as ArrayBuffer;

            const view = new DataView(buffer);
            const metaLength = view.getUint32(0);
            const metaBytes = buffer.slice(4, 4 + metaLength);
            const imageBytes = buffer.slice(4 + metaLength);

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
            const meta = JSON.parse(
                    new TextDecoder().decode(metaBytes)
                );
            
            return { ...meta, imageBytes }
}


export {
    formatBufferData,
    drawFrame,
    createSocket
}
