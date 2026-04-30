import type {  UsePcResult } from "#/types";
import { parseRtcDataMessage } from "../lib/detections";
import {  useEffect, useRef } from "react";
import { useHelperFunctions } from "./useHelperFunctions";
import { DETECTION_STALE_TIMEOUT_MS, RTCPeerConnectionConfig, WEBRTC_TARGET_PEER_ID } from "#/constants";

export const usePc = (ws?: WebSocket): UsePcResult => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const detectionClearTimersRef = useRef<Partial<Record<string, number | null>>>({});

  const {
    attachTrackToCamera,
    clearOverlay,
    animationFramesRef,
    resizeObserversRef,
    cameraBindingsRef,        
    applyTrackMap, 
    ensureCameraBinding,
    registerOverlayCanvas,
    registerVideoElement,
    scheduleOverlayDraw,
    latestDetectionByCameraRef,
    trackMidToCameraRef,
    pendingTracksByMidRef,
    cameraIds
  } = useHelperFunctions();

  if (!pcRef.current) {
    const pc = new RTCPeerConnection(RTCPeerConnectionConfig);

    pc.ontrack = (event) => {
      const mid = event.transceiver.mid;
      if (!mid) {
        return;
      }

      const cameraId = trackMidToCameraRef.current[mid];
      if (!cameraId) {
        pendingTracksByMidRef.current[mid] = event.track;
        return;
      }

      attachTrackToCamera(cameraId, event.track);
    };

    pc.onicecandidate = (event) => {
      const activeSocket = ws;
      if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN || !event.candidate) return;

      activeSocket.send(
        JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate.candidate,
          mid: event.candidate.sdpMid,
          targetPeerId: WEBRTC_TARGET_PEER_ID,
        })
      );
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      dcRef.current = channel;

      channel.onmessage = async (messageEvent) => {
        const message = await parseRtcDataMessage(messageEvent.data);
        if (!message) {
          return;
        }
        console.log(message)
        if (message.type === "track_map") {
          applyTrackMap(message.tracks);
          return;
        }

        latestDetectionByCameraRef.current[message.cameraId] = message;
        ensureCameraBinding(message.cameraId);
        scheduleOverlayDraw(message.cameraId);

        const existingTimer = detectionClearTimersRef.current[message.cameraId];
        if (existingTimer != null) {
          window.clearTimeout(existingTimer);
        }

        detectionClearTimersRef.current[message.cameraId] = window.setTimeout(() => {
          latestDetectionByCameraRef.current[message.cameraId] = null;
          detectionClearTimersRef.current[message.cameraId] = null;
          clearOverlay(message.cameraId);
        }, DETECTION_STALE_TIMEOUT_MS);
      };
    };

    pcRef.current = pc;
  }

  useEffect(() => {
    return () => {
      Object.values(animationFramesRef.current).forEach((frameId) => {
        if (frameId != null) {
          window.cancelAnimationFrame(frameId);
        }
      });

      Object.values(detectionClearTimersRef.current).forEach((timerId) => {
        if (timerId != null) {
          window.clearTimeout(timerId);
        }
      });

      Object.values(resizeObserversRef.current).forEach((observer) => {
        observer?.disconnect();
      });

      Object.values(cameraBindingsRef.current).forEach((binding) => {
        if (!binding) {
          return;
        }

        if (binding.video && binding.layoutHandler) {
          binding.video.removeEventListener("loadedmetadata", binding.layoutHandler);
          binding.video.removeEventListener("resize", binding.layoutHandler);
        }

        binding.stream.getTracks().forEach((track) => track.stop());
        if (binding.video) {
          binding.video.srcObject = null;
        }
      });

      pcRef.current?.close();
      pcRef.current = null;
      dcRef.current?.close();
      dcRef.current = null;
    };
  }, []);

  return {
    pc: pcRef.current,
    cameraIds,
    registerVideoElement,
    registerOverlayCanvas,
  };
};
