import type { UsePcResult } from '#/types'
import { parseRtcDataMessage } from '../lib/detections'
import { useCallback, useEffect, useRef } from 'react'
import { useHelperFunctions } from './useHelperFunctions'
import {
  DETECTION_STALE_TIMEOUT_MS,
  RTCPeerConnectionConfig,
  WEBRTC_TARGET_PEER_ID,
} from '#/constants'
import { useVideoLatencyMetrics } from './useVideoLatencyMetrics'

export const usePc = (ws?: WebSocket): UsePcResult => {
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const wsRef = useRef<WebSocket | undefined>(ws)
  const detectionClearTimersRef = useRef<
    Partial<Record<string, number | null>>
  >({})
  const {
    latencyMetrics,
    recordVideoLatencySample,
    registerLatencyVideoElement,
  } = useVideoLatencyMetrics()

  const {
    attachTrackToCamera,
    clearOverlay,
    cancelOverlayDraw,
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
    cameraIds,
  } = useHelperFunctions()

  useEffect(() => {
    wsRef.current = ws
  }, [ws])

  if (!pcRef.current) {
    const pc = new RTCPeerConnection(RTCPeerConnectionConfig)

    pc.ontrack = (event) => {
      const mid = event.transceiver.mid
      if (!mid) {
        return
      }

      const cameraId = trackMidToCameraRef.current[mid]
      if (!cameraId) {
        pendingTracksByMidRef.current[mid] = event.track
        return
      }

      attachTrackToCamera(cameraId, event.track)
    }

    pc.onicecandidate = (event) => {
      const activeSocket = wsRef.current
      if (
        !activeSocket ||
        activeSocket.readyState !== WebSocket.OPEN ||
        !event.candidate
      )
        return

      activeSocket.send(
        JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate.candidate,
          mid: event.candidate.sdpMid,
          targetPeerId: WEBRTC_TARGET_PEER_ID,
        }),
      )
    }

    pc.ondatachannel = (event) => {
      const channel = event.channel
      dcRef.current = channel

      channel.onmessage = async (messageEvent) => {
        const message = await parseRtcDataMessage(messageEvent.data)
        if (!message) {
          return
        }
        // Pipeline metrics messages are handled in a usePipelineMetrics hook, so we ignore them here
        // to avoid unnecessary processing and potential interference with the detection overlay logic in this hook
        if (message.type === 'pipeline_metrics') return

        if (message.type === 'track_map') {
          applyTrackMap(message.tracks)
          return
        }

        if (message.type === 'video_latency_sample') {
          ensureCameraBinding(message.cameraId)
          recordVideoLatencySample(message)
          return
        }

        const previousDetectionFrame =
          latestDetectionByCameraRef.current[message.cameraId]
        const hasDetections = message.detections.length > 0
        ensureCameraBinding(message.cameraId)

        if (hasDetections) {
          latestDetectionByCameraRef.current[message.cameraId] = message
          scheduleOverlayDraw(message.cameraId)
        } else if (!previousDetectionFrame?.detections.length) {
          latestDetectionByCameraRef.current[message.cameraId] = message
          clearOverlay(message.cameraId)
        }

        if (hasDetections) {
          const existingTimer =
            detectionClearTimersRef.current[message.cameraId]
          if (existingTimer != null) {
            window.clearTimeout(existingTimer)
            detectionClearTimersRef.current[message.cameraId] = null
          }

          // Set a timer to clear detections if we stop receiving updates, to prevent stale detections from lingering indefinitely
          // We only set this timer when we receive detections, to give a grace period for temporary issues (e.g. momentary network hiccup) without immediately clearing the overlay
          detectionClearTimersRef.current[message.cameraId] = window.setTimeout(
            () => {
              latestDetectionByCameraRef.current[message.cameraId] = null
              detectionClearTimersRef.current[message.cameraId] = null
              clearOverlay(message.cameraId)
            },
            DETECTION_STALE_TIMEOUT_MS,
          )
        } else if (!previousDetectionFrame?.detections.length) {
          const existingTimer =
            detectionClearTimersRef.current[message.cameraId]
          if (existingTimer != null) {
            window.clearTimeout(existingTimer)
            detectionClearTimersRef.current[message.cameraId] = null
          }
        }
      }
    }

    pcRef.current = pc
  }

  useEffect(() => {
    return () => {
      Object.keys(animationFramesRef.current).forEach(cancelOverlayDraw)

      Object.values(detectionClearTimersRef.current).forEach((timerId) => {
        if (timerId != null) {
          window.clearTimeout(timerId)
        }
      })

      Object.values(resizeObserversRef.current).forEach((observer) => {
        observer?.disconnect()
      })

      Object.values(cameraBindingsRef.current).forEach((binding) => {
        if (!binding) {
          return
        }

        if (binding.video && binding.layoutHandler) {
          binding.video.removeEventListener(
            'loadedmetadata',
            binding.layoutHandler,
          )
          binding.video.removeEventListener('resize', binding.layoutHandler)
        }

        binding.stream.getTracks().forEach((track) => track.stop())
        if (binding.video) {
          binding.video.srcObject = null
        }
      })

      pcRef.current?.close()
      pcRef.current = null
      dcRef.current?.close()
      dcRef.current = null
    }
  }, [
    animationFramesRef,
    cameraBindingsRef,
    cancelOverlayDraw,
    detectionClearTimersRef,
    resizeObserversRef,
  ])

  const registerLiveVideoElement = useCallback(
    (cameraId: string, element: HTMLVideoElement | null) => {
      registerVideoElement(cameraId, element)
      registerLatencyVideoElement(cameraId, element)
    },
    [registerLatencyVideoElement, registerVideoElement],
  )

  return {
    pc: pcRef.current,
    cameraIds,
    latencyMetrics,
    registerVideoElement: registerLiveVideoElement,
    registerOverlayCanvas,
  }
}
