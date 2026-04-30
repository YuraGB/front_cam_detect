import { HEARTBEAT_INTERVAL_MS, RECONNECT_BASE_DELAY_MS, RECONNECT_MAX_DELAY_MS, STREAM_INACTIVITY_TIMEOUT_MS, STREAM_URLS, type StreamType, type StreamURL } from "#/constants";
import { createSocket } from "#/lib/utilFunctions";
import type { StreamConnectionControl, StreamHealth } from "#/types";
import { useCallback, useEffect, useRef, useState } from "react";

const createStreamControl = (): StreamConnectionControl => ({
  ws: null,
  reconnectTimer: null,
  heartbeatTimer: null,
  reconnectAttempt: 0,
  lastMessageAt: 0,
  isRegistered: false,
  connectRequested: false,
  peerId: null,
});

const getStablePeerId = (streamName: StreamType): string => {
  const storageKey = `cam-frontend-peer-id:${streamName}`;
  try {
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) {
      return existing;
    }

    const generated = `frontend-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(storageKey, generated);
    return generated;
  } catch {
    return `frontend-${Math.random().toString(36).slice(2)}`;
  }
};

const emptyConnectionState: Record<StreamType, StreamHealth> = {
    liveStream: "disconnected",
    detectionStream: "disconnected",
    fileFrames: "disconnected",
    webrtc: "disconnected",
};

export const useWebsocket = () => {
    const [connectionState, setConnectionState] = useState<Record<StreamType, StreamHealth>>(emptyConnectionState);
    const wsRef = useRef<Partial<Record<StreamType, WebSocket>>>({});
    const isDisposedRef = useRef(false);
    const connectionControlsRef = useRef<Record<StreamType, StreamConnectionControl>>({
        liveStream: createStreamControl(),
        detectionStream: createStreamControl(),
        fileFrames: createStreamControl(),
        webrtc: createStreamControl(),
    });

    const updateConnectionState = useCallback(
    (streamName: StreamType, status: StreamHealth): void => {
        setConnectionState((prev) => {
        if (prev[streamName] === status) return prev;

        return {
            ...prev,
            [streamName]: status,
        };
        });
    },
    []
    );

    useEffect(() => {
        isDisposedRef.current = false;

        const connectStream = (streamUrl: StreamURL) => {
            const { socket, streamName } = createSocket(streamUrl);
            const streamControl = connectionControlsRef.current[streamName];
            const attemptNumber = streamControl.reconnectAttempt + 1;
            const isCurrentSocket = () => streamControl.ws === socket;

            streamControl.ws = socket;
            streamControl.isRegistered = false;
            streamControl.connectRequested = false;
            if (!streamControl.peerId) {
                streamControl.peerId = getStablePeerId(streamName);
            }
            wsRef.current[streamName] = socket;

            console.info("[WS] create", {
                streamName,
                streamUrl,
                attemptNumber,
            });

            updateConnectionState(
                streamName,
                streamControl.reconnectAttempt > 0 ? "reconnecting" : "connecting"
            );

            socket.onopen = () => {
                if (!isCurrentSocket()) {
                    console.info("[WS] ignoring open from stale socket", {
                        streamName,
                        streamUrl,
                        attemptNumber,
                    });
                    socket.close();
                    return;
                }
                console.info("[WS] open", {
                    streamName,
                    streamUrl,
                    attemptNumber,
                });
                streamControl.reconnectAttempt = 0;
                streamControl.lastMessageAt = Date.now();

                updateConnectionState(streamName, "connected");


                if (streamControl.heartbeatTimer !== null) {
                    window.clearInterval(streamControl.heartbeatTimer);
                }

                streamControl.heartbeatTimer = window.setInterval(() => {

                if (streamName === "webrtc") return;

                const now = Date.now();
                if (now - streamControl.lastMessageAt > STREAM_INACTIVITY_TIMEOUT_MS) {
                    updateConnectionState(streamName, "stalled");
                    streamControl.ws?.close();
                }
            }, HEARTBEAT_INTERVAL_MS);

            const peerId = streamControl.peerId ?? getStablePeerId(streamName);
            streamControl.peerId = peerId;

            socket.send(JSON.stringify({
                type: "register",
                peerId,
            }));
            streamControl.isRegistered = true;
        }
     
            socket.onerror = () => {
                if (!isCurrentSocket()) {
                    console.info("[WS] ignoring error from stale socket", {
                        streamName,
                        streamUrl,
                        attemptNumber,
                        readyState: socket.readyState,
                    });
                    return;
                }
                console.warn("[WS] error", {
                    streamName,
                    streamUrl,
                    attemptNumber,
                    readyState: socket.readyState,
                });
                updateConnectionState(streamName, "reconnecting");
                if (streamControl.heartbeatTimer !== null) {
                    window.clearInterval(streamControl.heartbeatTimer);
                    streamControl.heartbeatTimer = null;
                };
                if (streamControl.reconnectTimer !== null) {
                    window.clearTimeout(streamControl.reconnectTimer);
                    streamControl.reconnectTimer = null;
                };
            }

            socket.onclose = (event) => {
                if (!isCurrentSocket()) {
                    console.info("[WS] ignoring close from stale socket", {
                        streamName,
                        streamUrl,
                        attemptNumber,
                        code: event.code,
                        reason: event.reason,
                        wasClean: event.wasClean,
                    });
                    return;
                }
                console.warn("[WS] close", {
                    streamName,
                    streamUrl,
                    attemptNumber,
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean,
                    disposed: isDisposedRef.current,
                });
                if (streamControl.heartbeatTimer !== null) {
                    window.clearInterval(streamControl.heartbeatTimer);
                    streamControl.heartbeatTimer = null;
                }

                if (isDisposedRef.current) {
                    updateConnectionState(streamName, "disconnected");
                return;
                }

                if (event.code === 4001 && event.reason === "peer replaced") {
                    console.warn("[WS] peer replaced on current socket; waiting for active replacement instead of reconnecting", {
                        streamName,
                        streamUrl,
                        attemptNumber,
                    });
                    updateConnectionState(streamName, "reconnecting");
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

                console.info("[WS] reconnect scheduled", {
                    streamName,
                    streamUrl,
                    nextAttemptNumber: streamControl.reconnectAttempt + 1,
                    reconnectDelay,
                });
                streamControl.reconnectTimer = window.setTimeout(() => {
                    streamControl.reconnectTimer = null;
                    connectStream(streamUrl);
                }, reconnectDelay);
            };      
        }

        STREAM_URLS.forEach(connectStream);

        return () => {
            isDisposedRef.current = true;
            Object.values(wsRef.current).forEach((ws) => {
                if (ws) {
                    console.info("[WS] cleanup close", {
                        url: ws.url,
                        readyState: ws.readyState,
                    });
                    ws.close();
                }   
            });
        };
    }, [updateConnectionState]);

    return {
        connectionState,
        websockets:wsRef,
        connectionControlsRef,
    }    
}
