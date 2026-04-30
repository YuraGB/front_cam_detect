import { useEffect } from "react";
import { useWebsocket } from "./useWebsocket";
import { usePc } from "./usePc";
import parseWebRtcMessage from "../lib/parseWebRtcMessage";

export const useStreams = () => {
    const {connectionState, websockets, connectionControlsRef} = useWebsocket();
    const {pc, cameraIds, registerVideoElement, registerOverlayCanvas} = usePc(websockets.current.webrtc);

    useEffect(() => {
        const ws = websockets.current.webrtc;
        if (!ws || !pc || connectionState.webrtc !== "connected") return;

        const handler = async (event: MessageEvent): Promise<void> => {
            connectionControlsRef.current.webrtc.lastMessageAt = Date.now();
            const msg = parseWebRtcMessage(event.data);
            if (!msg) {
                return;
            }

            try {
                switch (msg.type) {
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

        return () => {
            ws.removeEventListener("message", handler);
        };
        
    }, [connectionControlsRef, connectionState.webrtc, pc, websockets]);

    return {
        cameraIds,
        registerVideoElement,
        registerOverlayCanvas,
    };
}
