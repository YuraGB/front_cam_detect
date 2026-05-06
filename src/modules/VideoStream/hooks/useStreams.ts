import { useEffect } from "react";
import { useWebsocket } from "./useWebsocket";
import { usePc } from "./usePc";
import parseWebRtcMessage from "../lib/parseWebRtcMessage";
import { WEBRTC_TARGET_PEER_ID } from "#/constants";

const OFFER_RETRY_DELAY_MS = 1000;

export const useStreams = () => {
    const {connectionState, websockets, connectionControlsRef} = useWebsocket();
    const {pc, cameraIds, latencyMetrics, registerVideoElement, registerOverlayCanvas} = usePc(websockets.current.webrtc);

    useEffect(() => {
        const ws = websockets.current.webrtc;
        if (!ws || !pc || connectionState.webrtc !== "connected") return;
        const streamControl = connectionControlsRef.current.webrtc;
        let offerRetryTimer: number | null = null;

        const requestOffer = () => {
            if (ws.readyState !== WebSocket.OPEN || streamControl.connectRequested) {
                return;
            }

            ws.send(JSON.stringify({
                type: "viewer-join",
                targetPeerId: WEBRTC_TARGET_PEER_ID,
            }));
            streamControl.connectRequested = true;
        };

        const handler = async (event: MessageEvent): Promise<void> => {
            streamControl.lastMessageAt = Date.now();
            const msg = parseWebRtcMessage(event.data);
            if (!msg) {
                return;
            }

            try {
                switch (msg.type) {
                    case "registered":
                        requestOffer();
                        break;

                    case "error":
                        if (msg.code === "TARGET_NOT_FOUND") {
                            streamControl.connectRequested = false;
                            if (offerRetryTimer != null) {
                                window.clearTimeout(offerRetryTimer);
                            }
                            offerRetryTimer = window.setTimeout(() => {
                                offerRetryTimer = null;
                                requestOffer();
                            }, OFFER_RETRY_DELAY_MS);
                        }
                        break;

                    case "offer": {
                        await pc.setRemoteDescription({
                            type: "offer",
                            sdp: msg.sdp,
                        });

                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: "answer",
                                sdp: answer.sdp,
                                targetPeerId: msg.peerId,
                            }));
                        }
                        break;
                    }

                    case "answer":
                        await pc.setRemoteDescription({
                            type: "answer",
                            sdp: msg.sdp,
                        });
                        break;

                    case "ice-candidate":
                        await pc.addIceCandidate({
                            candidate: msg.candidate,
                            sdpMid: msg.mid,
                        });
                        break;
                }
            } catch (error) {
                console.error("Failed to handle WebRTC signaling message", error);
            }
        };

        ws.addEventListener("message", handler);
        requestOffer();

        return () => {
            if (offerRetryTimer != null) {
                window.clearTimeout(offerRetryTimer);
            }
            ws.removeEventListener("message", handler);
        };
        
    }, [connectionControlsRef, connectionState.webrtc, pc, websockets]);

    return {
        cameraIds,
        latencyMetrics,
        registerVideoElement,
        registerOverlayCanvas,
    };
}
