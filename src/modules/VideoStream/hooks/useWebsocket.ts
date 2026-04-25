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
});

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

            streamControl.ws = socket;
            wsRef.current[streamName] = socket;

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

                if (streamName === "webrtc") return;

                const now = Date.now();
                if (now - streamControl.lastMessageAt > STREAM_INACTIVITY_TIMEOUT_MS) {
                    updateConnectionState(streamName, "stalled");
                    streamControl.ws?.close();
                }
            }, HEARTBEAT_INTERVAL_MS);

            const peerId = "frontend-" + Math.random().toString(36).slice(2);

            socket.send(JSON.stringify({
                type: "register",
                peerId: peerId,
            }));

             socket.send(JSON.stringify({
                type: "connect",
                peerId: peerId,
                targetPeerId: "camera-cv-service"
            }));
        }
     
            socket.onerror = () => {
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
        }

        STREAM_URLS.forEach(connectStream);

        return () => {
            isDisposedRef.current = true;
            Object.values(wsRef.current).forEach((ws) => {
                if (ws) {
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