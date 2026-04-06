import { STREAM_URLS } from "#/constants";
import type { StreamType, StreamURL, VideoResources } from "#/constants";
import { drawDetections } from "@/lib/drawDetections";
import type { Detection } from "@/lib/drawDetections";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSocket, drawFrame, formatBufferData } from "../lib";

type PendingFrame = {
  cameraId: string;
  streamName: StreamType;
  imageBytes: ArrayBuffer;
  detections: Detection[];
  timestamp: number | null;
};

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

const HEARTBEAT_INTERVAL_MS = 5000;
const STREAM_INACTIVITY_TIMEOUT_MS = 15000;
const RECONNECT_BASE_DELAY_MS = 500;
const RECONNECT_MAX_DELAY_MS = 10000;
const STATS_PUBLISH_INTERVAL_MS = 500;

const createMetric = (): StreamMetricMutable => ({
  fps: 0,
  rendered: 0,
  dropped: 0,
  decodeMs: 0,
  latencyMs: null,
  lastRenderedAt: 0,
});

const createStreamControl = (): StreamConnectionControl => ({
  ws: null,
  reconnectTimer: null,
  heartbeatTimer: null,
  reconnectAttempt: 0,
  lastMessageAt: 0,
});

const emptyConnectionState: Record<StreamType, StreamHealth> = {
  liveStream: "disconnected",
  detectionStream: "disconnected",
};

export type CameraStreamStats = Partial<Record<StreamType, StreamMetric>>;

export const useCanvasContainer = () => {
  const wsRef = useRef<Partial<Record<StreamType, WebSocket>>>({});
  const videoResourcesRef = useRef<VideoResources>({});
  const knownCamerasRef = useRef<Set<string>>(new Set());
  const pendingFramesRef = useRef<Partial<Record<string, PendingFrame>>>({});
  const renderingRef = useRef<Record<string, boolean>>({});
  const metricsRef = useRef<Partial<Record<string, Partial<Record<StreamType, StreamMetricMutable>>>>>({});
  const rafIdRef = useRef<number | null>(null);
  const isDisposedRef = useRef(false);
  const connectionControlsRef = useRef<Record<StreamType, StreamConnectionControl>>({
    liveStream: createStreamControl(),
    detectionStream: createStreamControl(),
  });

  const [cameras, setCameras] = useState<string[]>([]);
  const [streamStats, setStreamStats] = useState<Record<string, CameraStreamStats>>({});
  const [connectionState, setConnectionState] = useState<Record<StreamType, StreamHealth>>(emptyConnectionState);

  const updateConnectionState = useCallback((streamName: StreamType, status: StreamHealth) => {
    setConnectionState((prev) => {
      if (prev[streamName] === status) {
        return prev;
      }

      return {
        ...prev,
        [streamName]: status,
      };
    });
  }, []);

  const ensureMetricRef = useCallback((cameraId: string, streamName: StreamType): StreamMetricMutable => {
    const cameraMetrics = metricsRef.current[cameraId] ?? {};
    if (!metricsRef.current[cameraId]) {
      metricsRef.current[cameraId] = cameraMetrics;
    }

    const existingMetric = cameraMetrics[streamName];
    if (existingMetric) {
      return existingMetric;
    }

    const metric = createMetric();
    cameraMetrics[streamName] = metric;
    return metric;
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafIdRef.current !== null) {
      return;
    }

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;

      Object.entries(pendingFramesRef.current).forEach(([key, frame]) => {
        if (!frame || renderingRef.current[key]) {
          return;
        }

        if (frame.streamName === "liveStream" && frame.imageBytes.byteLength === 0) {
          return;
        }

        renderingRef.current[key] = true;
        delete pendingFramesRef.current[key];

        const cameraResources = videoResourcesRef.current[frame.cameraId];
        const canvas = cameraResources?.[frame.streamName];
        if (!canvas) {
          renderingRef.current[key] = false;
          return;
        }

        const drawStartedAt = performance.now();

        void (async () => {
          try {
            if (frame.streamName === "liveStream") {
              const liveDimensions = await drawFrame(canvas, frame.imageBytes);
              if (!liveDimensions) {
                return;
              }
            } else {
              const detectionDimensions = await drawFrame(canvas, frame.imageBytes);
              if (!detectionDimensions) {
                return;
              }

              drawDetections(canvas, frame.detections, detectionDimensions.width, detectionDimensions.height);
            }

            const metric = ensureMetricRef(frame.cameraId, frame.streamName);
            const renderFinishedAt = performance.now();
            const drawDurationMs = renderFinishedAt - drawStartedAt;

            metric.rendered += 1;
            metric.decodeMs = metric.decodeMs === 0 ? drawDurationMs : metric.decodeMs * 0.8 + drawDurationMs * 0.2;

            if (metric.lastRenderedAt > 0) {
              const instantFps = 1000 / (renderFinishedAt - metric.lastRenderedAt);
              const cappedInstantFps = Number.isFinite(instantFps) ? Math.min(instantFps, 120) : 0;
              metric.fps = metric.fps === 0 ? cappedInstantFps : metric.fps * 0.8 + cappedInstantFps * 0.2;
            }

            metric.lastRenderedAt = renderFinishedAt;
            metric.latencyMs =
              typeof frame.timestamp === "number" ? Math.max(0, Date.now() - frame.timestamp) : null;
          } catch (error) {
            console.error("Error while rendering frame:", error);
          } finally {
            renderingRef.current[key] = false;
            if (pendingFramesRef.current[key]) {
              scheduleFlush();
            }
          }
        })();
      });

      if (Object.keys(pendingFramesRef.current).length > 0) {
        scheduleFlush();
      }
    });
  }, [ensureMetricRef]);

  useEffect(() => {
    isDisposedRef.current = false;

    const connectStream = (streamUrl: StreamURL) => {
      const { socket, streamName } = createSocket(streamUrl);
      const streamControl = connectionControlsRef.current[streamName];

      streamControl.ws = socket;
      wsRef.current[streamName] = socket;
      socket.binaryType = "arraybuffer";

      updateConnectionState(
        streamName,
        streamControl.reconnectAttempt > 0 ? "reconnecting" : "connecting"
      );

      socket.onopen = () => {
        streamControl.reconnectAttempt = 0;
        streamControl.lastMessageAt = Date.now();
        updateConnectionState(streamName, "connected");

        if (streamControl.heartbeatTimer !== null) {
          window.clearInterval(streamControl.heartbeatTimer);
        }

        streamControl.heartbeatTimer = window.setInterval(() => {
          const now = Date.now();
          if (now - streamControl.lastMessageAt > STREAM_INACTIVITY_TIMEOUT_MS) {
            updateConnectionState(streamName, "stalled");
            streamControl.ws?.close();
          }
        }, HEARTBEAT_INTERVAL_MS);
      };

      socket.onmessage = (event) => {
        try {
          streamControl.lastMessageAt = Date.now();
          const { cameraId, imageBytes, detections, timestamp } = formatBufferData(
            { data: event.data },
            { includeImageBytes: true }
          );

          if (!cameraId) {
            return;
          }

          if (!knownCamerasRef.current.has(cameraId)) {
            knownCamerasRef.current.add(cameraId);
            setCameras((prev) => [...prev, cameraId]);
          }

          const key = `${cameraId}::${streamName}`;
          if (pendingFramesRef.current[key]) {
            const metric = ensureMetricRef(cameraId, streamName);
            metric.dropped += 1;
          }

          pendingFramesRef.current[key] = {
            cameraId,
            streamName,
            imageBytes,
            detections,
            timestamp,
          };

          scheduleFlush();
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      socket.onerror = () => {
        updateConnectionState(streamName, "reconnecting");
      };

      socket.onclose = () => {
        if (streamControl.heartbeatTimer !== null) {
          window.clearInterval(streamControl.heartbeatTimer);
          streamControl.heartbeatTimer = null;
        }

        if (isDisposedRef.current) {
          updateConnectionState(streamName, "disconnected");
          return;
        }

        updateConnectionState(streamName, "reconnecting");

        const reconnectDelay = Math.min(
          RECONNECT_MAX_DELAY_MS,
          RECONNECT_BASE_DELAY_MS * 2 ** streamControl.reconnectAttempt
        ) + Math.floor(Math.random() * 250);

        streamControl.reconnectAttempt += 1;

        if (streamControl.reconnectTimer !== null) {
          window.clearTimeout(streamControl.reconnectTimer);
        }

        streamControl.reconnectTimer = window.setTimeout(() => {
          streamControl.reconnectTimer = null;
          connectStream(streamUrl);
        }, reconnectDelay);
      };
    };

    STREAM_URLS.forEach((streamUrl) => connectStream(streamUrl));

    return () => {
      isDisposedRef.current = true;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      Object.values(connectionControlsRef.current).forEach((control) => {
        if (control.reconnectTimer !== null) {
          window.clearTimeout(control.reconnectTimer);
        }

        if (control.heartbeatTimer !== null) {
          window.clearInterval(control.heartbeatTimer);
        }

        control.ws?.close();
      });

      Object.values(wsRef.current).forEach((ws) => ws.close());
    };
  }, [ensureMetricRef, scheduleFlush, updateConnectionState]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const snapshot: Record<string, CameraStreamStats> = {};

      Object.entries(metricsRef.current).forEach(([cameraId, cameraMetrics]) => {
        if (!cameraMetrics) {
          return;
        }

        snapshot[cameraId] = {};

        (Object.entries(cameraMetrics) as Array<[StreamType, StreamMetricMutable]>).forEach(
          ([streamName, metric]) => {
            snapshot[cameraId][streamName] = {
              fps: Number(metric.fps.toFixed(1)),
              rendered: metric.rendered,
              dropped: metric.dropped,
              decodeMs: Number(metric.decodeMs.toFixed(1)),
              latencyMs: metric.latencyMs === null ? null : Math.round(metric.latencyMs),
            };
          }
        );
      });

      setStreamStats(snapshot);
    }, STATS_PUBLISH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const registerCanvas = useCallback(
    (cameraId: string, streamName: StreamType, canvas: HTMLCanvasElement | null) => {
      if (!canvas) {
        return;
      }

      if (!videoResourcesRef.current[cameraId]) {
        videoResourcesRef.current[cameraId] = {};
      }

      videoResourcesRef.current[cameraId][streamName] = canvas;
    },
    []
  );

  return {
    cameras,
    registerCanvas,
    streamStats,
    connectionState,
  };
};
