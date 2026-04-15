import { useEffect } from "react";
import { useWebsocket } from "./useWebsocket";
import { usePc } from "./usePc";

interface OfferMessage {
    type: "offer";
    sdp: string;
    peerId: string;
}

interface AnswerMessage {
    type: "answer";
    sdp: string;
}

interface IceCandidateMessage {
    type: "ice-candidate";
    candidate: string;
    mid: string;
}

type WebRtcMessage = OfferMessage | AnswerMessage | IceCandidateMessage;

export const useStreams = (): { videoRef: React.RefObject<HTMLVideoElement | null> } => {
    const {connectionState, websockets} = useWebsocket();
    const {pc, videoRef} = usePc(websockets.current.webrtc);

    useEffect(() => {
        const ws = websockets.current.webrtc;
        if (!ws || connectionState.webrtc !== "connected") return;

        const handler = async (event: MessageEvent): Promise<void> => {
            const msg: WebRtcMessage = JSON.parse(event.data);
            console.log("Received WebRTC message:", msg);

            switch (msg.type) {
                case "offer":
                await pc.setRemoteDescription({
                    type: "offer",
                    sdp: msg.sdp,
                });

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                ws.send(JSON.stringify({
                    type: "answer",
                    sdp: answer.sdp,
                    targetPeerId: msg.peerId,
                }));
                break;

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
            };

        ws.addEventListener("message", handler);

        return () => {
            ws.removeEventListener("message", handler);
        };
        
    }, [connectionState.webrtc]);

    return {
            videoRef,
    };
}