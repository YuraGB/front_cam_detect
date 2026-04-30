import type { CameraBinding } from "#/types";
import { useCallback, useRef, useState } from "react";
import type { DetectionFrameMessage } from "../lib/detections";
import { clearCanvas, drawDetectionsOverlay } from "#/lib/drawDetections";

export const useHelperFunctions = () => {
  const [cameraIds, setCameraIds] = useState<string[]>([]);

  const animationFramesRef = useRef<Partial<Record<string, number | null>>>({});
  const resizeObserversRef = useRef<Partial<Record<string, ResizeObserver | null>>>({});
  const cameraBindingsRef = useRef<Partial<Record<string, CameraBinding>>>({});       
  const trackMidToCameraRef = useRef<Partial<Record<string, string>>>({});
  const pendingTracksByMidRef = useRef<Partial<Record<string, MediaStreamTrack>>>({});      
  const latestDetectionByCameraRef = useRef<Partial<Record<string, DetectionFrameMessage | null>>>({});
  
  const ensureCameraBinding = useCallback((cameraId: string): CameraBinding => {
    const existing = cameraBindingsRef.current[cameraId];
    
    if (existing) {
      return existing;
    }

    const binding: CameraBinding = {
      stream: new MediaStream(),
      video: null,
      canvas: null,
      layoutHandler: null,
    };
    cameraBindingsRef.current[cameraId] = binding;
    setCameraIds((prev) => (prev.includes(cameraId) ? prev : [...prev, cameraId]));
    return binding;
  }, []);

  const syncOverlaySize = useCallback((cameraId: string) => {
    const binding = cameraBindingsRef.current[cameraId];
    const video = binding?.video;
    const canvas = binding?.canvas;
    if (!video || !canvas) {
      return;
    }

    const width = Math.max(1, Math.round(video.clientWidth));
    const height = Math.max(1, Math.round(video.clientHeight));

    if (canvas.style.width !== `${width}px`) {
      canvas.style.width = `${width}px`;
    }

    if (canvas.style.height !== `${height}px`) {
      canvas.style.height = `${height}px`;
    }
  }, []);

  const clearOverlay = useCallback(
    (cameraId: string) => {
      const canvas = cameraBindingsRef.current[cameraId]?.canvas;
      console.log(!canvas, "here")
      if (!canvas) {
        return;
      }

      syncOverlaySize(cameraId);
      clearCanvas(canvas);
    },
    [syncOverlaySize]
  );

  const scheduleOverlayDraw = useCallback(
    (cameraId: string) => {
      if (animationFramesRef.current[cameraId] != null) {
        return;
      }

      animationFramesRef.current[cameraId] = window.requestAnimationFrame(() => {
        animationFramesRef.current[cameraId] = null;

        const binding = cameraBindingsRef.current[cameraId];
        const video = binding?.video;
        const canvas = binding?.canvas;
        const detectionFrame = latestDetectionByCameraRef.current[cameraId];

        if (!video || !canvas || !detectionFrame) {
          clearOverlay(cameraId);
          return;
        }

        syncOverlaySize(cameraId);
        drawDetectionsOverlay(canvas, detectionFrame.detections, {
          sourceWidth: video.videoWidth || video.clientWidth || 1,
          sourceHeight: video.videoHeight || video.clientHeight || 1,
        });
      });
    },
    [clearOverlay, syncOverlaySize]
  );

  const attachTrackToCamera = useCallback(
    (cameraId: string, track: MediaStreamTrack) => {
      const binding = ensureCameraBinding(cameraId);

      binding.stream.getVideoTracks().forEach((existingTrack) => {
        binding.stream.removeTrack(existingTrack);
      });
      binding.stream.addTrack(track);

      if (binding.video && binding.video.srcObject !== binding.stream) {
        binding.video.srcObject = binding.stream;
      }

      scheduleOverlayDraw(cameraId);
    },
    [ensureCameraBinding, scheduleOverlayDraw]
  );

  const applyTrackMap = useCallback(
    (tracks: Array<{ mid: string; cameraId: string }>) => {
      tracks.forEach(({ mid, cameraId }) => {
        trackMidToCameraRef.current[mid] = cameraId;
        ensureCameraBinding(cameraId);

        const pendingTrack = pendingTracksByMidRef.current[mid];
        if (pendingTrack) {
          attachTrackToCamera(cameraId, pendingTrack);
          delete pendingTracksByMidRef.current[mid];
        }
      });
    },
    [attachTrackToCamera, ensureCameraBinding]
  );

  const registerVideoElement = useCallback(
    (cameraId: string, element: HTMLVideoElement | null) => {
      const binding = ensureCameraBinding(cameraId);
      const previousVideo = binding.video;
      if (previousVideo && binding.layoutHandler) {
        previousVideo.removeEventListener("loadedmetadata", binding.layoutHandler);
        previousVideo.removeEventListener("resize", binding.layoutHandler);
      }

      binding.video = element;
      binding.layoutHandler = null;

      resizeObserversRef.current[cameraId]?.disconnect();
      resizeObserversRef.current[cameraId] = null;

      if (!element) {
        return;
      }

      element.srcObject = binding.stream;
      const handleLayoutChange = () => {
        if (latestDetectionByCameraRef.current[cameraId]?.detections.length) {
          scheduleOverlayDraw(cameraId);
          return;
        }

        syncOverlaySize(cameraId);
        clearOverlay(cameraId);
      };

      binding.layoutHandler = handleLayoutChange;
      handleLayoutChange();
      element.addEventListener("loadedmetadata", handleLayoutChange);
      element.addEventListener("resize", handleLayoutChange);

      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(handleLayoutChange);
        observer.observe(element);
        resizeObserversRef.current[cameraId] = observer;
      }
    },
    [clearOverlay, ensureCameraBinding, scheduleOverlayDraw, syncOverlaySize]
  );

  const registerOverlayCanvas = useCallback(
    (cameraId: string, element: HTMLCanvasElement | null) => {
      const binding = ensureCameraBinding(cameraId);
      binding.canvas = element;

      if (!element) {
        return;
      }

      syncOverlaySize(cameraId);
      const detectionFrame = latestDetectionByCameraRef.current[cameraId];
      if (detectionFrame?.detections.length) {
        scheduleOverlayDraw(cameraId);
        return;
      }

      clearCanvas(element);
    },
    [ensureCameraBinding, scheduleOverlayDraw, syncOverlaySize]
  );

  return {
    ensureCameraBinding,
    syncOverlaySize,
    clearOverlay,
    scheduleOverlayDraw,
    attachTrackToCamera,
    applyTrackMap,
    registerVideoElement,
    registerOverlayCanvas,
    latestDetectionByCameraRef,
    trackMidToCameraRef,
    pendingTracksByMidRef,
    cameraIds,
    animationFramesRef,
    resizeObserversRef,
    cameraBindingsRef,
  };
}