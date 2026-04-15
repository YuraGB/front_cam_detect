import { useRef } from "react";

export const usePc = (ws?: WebSocket) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    if (!pcRef.current) {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        
        pc.addTransceiver("video", { direction: "recvonly" });

        pc.ontrack = (event) => {
            if (videoRef.current) {
                videoRef.current.srcObject = event.streams[0];
            }
        };

                pc.onicecandidate = (event) => {
            if (!ws || ws.readyState !== WebSocket.OPEN) return;

            if (event.candidate) {
                ws.send(JSON.stringify({
                    type: "ice-candidate",
                    candidate: event.candidate.candidate,
                    mid: event.candidate.sdpMid,
                    targetPeerId: "cpp-service",
                }));
            }
        };

        pcRef.current = pc;
        
    }

    return { pc: pcRef.current, videoRef };
};