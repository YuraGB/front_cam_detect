import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoLatencySampleMessage } from "../lib/detections";

export type VideoLatencyMetric = {
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

const toDisplayEpochMs = (now: DOMHighResTimeStamp): number => performance.timeOrigin + now;

const calculateLatencyMs = (displayTimestampMs: number, captureTimestampMs: number): number =>
  Math.max(0, Math.round(displayTimestampMs - captureTimestampMs));

export const useVideoLatencyMetrics = () => {
  const [latencyMetrics, setLatencyMetrics] = useState<Partial<Record<string, VideoLatencyMetric>>>({});
  const videosRef = useRef<Partial<Record<string, HTMLVideoElement>>>({});
  const pendingSamplesRef = useRef<Partial<Record<string, VideoLatencySampleMessage>>>({});
  const callbackHandlesRef = useRef<Partial<Record<string, ScheduledFrameCallback>>>({});

  const cancelFrameCallback = useCallback((cameraId: string) => {
    const scheduled = callbackHandlesRef.current[cameraId];
    if (!scheduled) {
      return;
    }

    const video = videosRef.current[cameraId];
    const cancelVideoFrameCallback = video
      ? Reflect.get(video, "cancelVideoFrameCallback")
      : undefined;
    if (scheduled.type === "video-frame" && typeof cancelVideoFrameCallback === "function") {
      cancelVideoFrameCallback.call(video, scheduled.handle);
    } else {
      window.cancelAnimationFrame(scheduled.handle);
    }

    delete callbackHandlesRef.current[cameraId];
  }, []);

  const scheduleFrameCallback = useCallback(
    (cameraId: string) => {
      if (callbackHandlesRef.current[cameraId]) {
        return;
      }

      const video = videosRef.current[cameraId];
      if (!video) {
        return;
      }

      const onRenderedFrame = (now: DOMHighResTimeStamp) => {
        delete callbackHandlesRef.current[cameraId];

        const sample = pendingSamplesRef.current[cameraId];
        if (sample) {
          delete pendingSamplesRef.current[cameraId];

          const displayTimestampMs = toDisplayEpochMs(now);
          setLatencyMetrics((prev) => ({
            ...prev,
            [cameraId]: {
              latencyMs: calculateLatencyMs(displayTimestampMs, sample.captureTimestampMs),
              captureTimestampMs: sample.captureTimestampMs,
              encodedTimestampMs: sample.encodedTimestampMs,
              displayTimestampMs,
              frameId: sample.frameId,
              updatedAt: Date.now(),
            },
          }));
        }

        if (pendingSamplesRef.current[cameraId]) {
          scheduleFrameCallback(cameraId);
        }
      };

      const requestVideoFrameCallback = Reflect.get(video, "requestVideoFrameCallback");
      if (typeof requestVideoFrameCallback === "function") {
        callbackHandlesRef.current[cameraId] = {
          type: "video-frame",
          handle: requestVideoFrameCallback.call(video, onRenderedFrame),
        };
        return;
      }

      callbackHandlesRef.current[cameraId] = {
        type: "animation-frame",
        handle: window.requestAnimationFrame(onRenderedFrame),
      };
    },
    []
  );

  const registerLatencyVideoElement = useCallback(
    (cameraId: string, element: HTMLVideoElement | null) => {
      cancelFrameCallback(cameraId);

      if (!element) {
        delete videosRef.current[cameraId];
        delete pendingSamplesRef.current[cameraId];
        return;
      }

      videosRef.current[cameraId] = element;
      if (pendingSamplesRef.current[cameraId]) {
        scheduleFrameCallback(cameraId);
      }
    },
    [cancelFrameCallback, scheduleFrameCallback]
  );

  const recordVideoLatencySample = useCallback(
    (sample: VideoLatencySampleMessage) => {
      pendingSamplesRef.current[sample.cameraId] = sample;
      scheduleFrameCallback(sample.cameraId);
    },
    [scheduleFrameCallback]
  );

  useEffect(() => {
    return () => {
      Object.keys(callbackHandlesRef.current).forEach(cancelFrameCallback);
    };
  }, [cancelFrameCallback]);

  return {
    latencyMetrics,
    recordVideoLatencySample,
    registerLatencyVideoElement,
  };
};
