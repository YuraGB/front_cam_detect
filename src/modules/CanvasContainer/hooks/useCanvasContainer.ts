import { STREAM_URLS, type StreamType, type VideoResources } from "#/constants";
import { drawDetections } from "@/lib/drawDetections";
import { useEffect, useRef, useState } from "react";
import { createSocket, drawFrame, formatBufferData } from "../lib";

/**
 * Custom React hook to manage WebSocket connections for video streams and handle canvas rendering for live video and detection overlays.
 * It establishes WebSocket connections for predefined stream URLs, processes incoming video frames and detection data, and provides a mechanism to register canvas elements for rendering.
 * @returns An object containing the list of camera IDs and a function to register canvas elements for specific cameras and stream types.
 */
export const useCanvasContainer = () => {
  const wsRef = useRef<Record<StreamType, WebSocket>>(
    {} as Record<StreamType, WebSocket>
  );
  const detectionsRef = useRef<Record<string, any[]>>({});

  const videoResourcesRef = useRef<VideoResources>({});

  const [cameras, setCameras] = useState<string[]>([]);

  useEffect(() => {
    STREAM_URLS.forEach((streamUrl) => {
      const { socket, streamName } = createSocket(streamUrl);
      
      if (!socket || !streamName) {
        console.error(`Failed to create WebSocket for ${streamUrl}`);
        return;
      }

      wsRef.current[streamName as StreamType] = socket;

      socket.binaryType = "arraybuffer";
      socket.onmessage = async(event) => {
        try {         
          console.log(`Received message on ${streamName} with data size: ${event.data.byteLength} bytes`);
          const { cameraId, imageBytes, detections } = formatBufferData({ data: event.data });
          if (!cameraId) {
            console.error("Camera ID not found in message data");
            return;
          }

          console.log(`Processing frame for camera ${cameraId} on stream ${streamName}`);
          if (!videoResourcesRef.current[cameraId]) {

            setCameras((prev) => {
              if (prev.includes(cameraId)) return prev;
              return [...prev, cameraId];
            });
          }

        
        const canvas = videoResourcesRef.current[cameraId]?.[streamName];
        if(!canvas) {
          console.warn(`Canvas not found for camera ${cameraId} and stream ${streamName}`);
          return
        } 

      if (streamName === "detectionStream") {
        detectionsRef.current[cameraId] = detections || [];
      }

     if (streamName === "liveStream") {
  drawFrame(canvas, imageBytes);

  const detections = detectionsRef.current[cameraId];
  if (detections?.length) {
    drawDetections(canvas, detections);
  }
}


        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }   
      };
    });

    return () => {
      Object.values(wsRef.current).forEach((ws) => ws.close());
    };
  }, []);

  // Registers a canvas element for a specific camera and stream type
  const registerCanvas = (
    cameraId: string,
    streamName: string,
    canvas: HTMLCanvasElement | null
  ) => {
    if (!canvas) return;

    if (!videoResourcesRef.current[cameraId]) {
      videoResourcesRef.current[cameraId] = {};
    }

    videoResourcesRef.current[cameraId][streamName] = canvas;
  };

  return {
    cameras,         // The list of camera IDs that have been registered
    registerCanvas,  // Function to register a canvas element for a specific camera and stream type
  };
};
