import type { UsePcOptions, UsePcResult } from '#/types'
import { parseRtcDataMessage } from '../lib/detections'
import { useCallback, useEffect, useRef } from 'react'
import { useHelperFunctions } from './useHelperFunctions'
import {
  DETECTION_STALE_TIMEOUT_MS,
  RTCPeerConnectionConfig,
  WEBRTC_TARGET_PEER_ID,
} from '#/constants'
import { useVideoLatencyMetrics } from './useVideoLatencyMetrics'
import { safeJsonStringify } from '#/lib/asyncActionHandler'

export const usePc = (
  ws?: WebSocket,
  options: UsePcOptions = {},
): UsePcResult => {
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
    shouldDrawOverlay,
    cameraIds,
  } = useHelperFunctions()

  useEffect(() => {
    wsRef.current = ws
  }, [ws])

  const onPipelineMetricsRef = useRef(options.onPipelineMetrics)

  useEffect(() => {
    onPipelineMetricsRef.current = options.onPipelineMetrics
  }, [options.onPipelineMetrics])

  const createPeerConnection = useCallback((): RTCPeerConnection => {
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
        safeJsonStringify({
          type: 'ice-candidate',
          candidate: event.candidate.candidate,
          mid: event.candidate.sdpMid,
          targetPeerId: WEBRTC_TARGET_PEER_ID,
        }) || '',
      )
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        const activeSocket = wsRef.current
        pc.close()
        if (pcRef.current === pc) {
          pcRef.current = null
        }
        dcRef.current?.close()
        dcRef.current = null
        if (
          activeSocket?.readyState === WebSocket.OPEN ||
          activeSocket?.readyState === WebSocket.CONNECTING
        ) {
          activeSocket.close()
        }
      }
    }

    pc.ondatachannel = (event) => {
      const channel = event.channel
      if (dcRef.current && dcRef.current !== channel) {
        dcRef.current.close()
      }
      dcRef.current = channel

      channel.onmessage = async (messageEvent) => {
        const message = await parseRtcDataMessage(messageEvent.data)
        if (!message) {
          return
        }
        if (message.type === 'pipeline_metrics') {
          onPipelineMetricsRef.current?.(message)
          return
        }

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

    return pc
  }, [
    applyTrackMap,
    attachTrackToCamera,
    clearOverlay,
    ensureCameraBinding,
    latestDetectionByCameraRef,
    pendingTracksByMidRef,
    recordVideoLatencySample,
    scheduleOverlayDraw,
    trackMidToCameraRef,
  ])

  const getPeerConnection = useCallback((): RTCPeerConnection => {
    const current = pcRef.current
    if (
      current &&
      current.connectionState !== 'closed' &&
      current.connectionState !== 'failed'
    ) {
      return current
    }

    const pc = createPeerConnection()
    pcRef.current = pc
    return pc
  }, [createPeerConnection])

  useEffect(() => {
    getPeerConnection()
  }, [getPeerConnection])
  /**
   * Cleanup logic when the component using this hook unmounts: we need to stop all media tracks,
   * close the peer connection and data channel, remove event listeners, cancel animation frames, clear timers,
   * disconnect resize observers, and clean up any references to DOM elements to prevent memory
   * leaks and ensure that everything is properly cleaned up when the component is no longer in use.
   */
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
    pcRef,
    getPeerConnection,
    cameraIds,
    latencyMetrics,
    registerVideoElement: registerLiveVideoElement,
    registerOverlayCanvas,
    shouldDrawOverlay,
  }
}
