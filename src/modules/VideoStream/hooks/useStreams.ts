import { useEffect } from 'react'
import { useWebsocket } from './useWebsocket'
import { usePc } from './usePc'
import parseWebRtcMessage from '../lib/parseWebRtcMessage'
import { OFFER_RETRY_DELAY_MS, WEBRTC_TARGET_PEER_ID } from '#/constants'
import { usePipelineMetrics } from './usePipelineMetrics'
import { safeJsonStringify } from '#/lib/asyncActionHandler'

export const useStreams = () => {
  const { connectionState, websockets, connectionControlsRef } = useWebsocket()
  const { pipelineMetrics, recordPipelineMetrics } = usePipelineMetrics()
  const {
    getPeerConnection,
    cameraIds,
    latencyMetrics,
    registerVideoElement,
    registerOverlayCanvas,
    shouldDrawOverlay,
  } = usePc(websockets.current.webrtc, {
    onPipelineMetrics: recordPipelineMetrics,
  })

  useEffect(() => {
    const ws = websockets.current.webrtc
    if (!ws || connectionState.webrtc !== 'connected') return
    const pc = getPeerConnection()
    const streamControl = connectionControlsRef.current.webrtc
    let offerRetryTimer: number | null = null
    let isHandlingOffer = false
    let remotePeerId: string | null = null
    const pendingIceCandidates: Array<{
      candidate: RTCIceCandidateInit
      peerId: string
    }> = []

    /**
     * Requests an offer from the remote peer.
     * @returns
     */
    const requestOffer = () => {
      if (
        ws.readyState !== WebSocket.OPEN ||
        streamControl.connectRequested ||
        pc.connectionState === 'connected' ||
        pc.connectionState === 'connecting' ||
        pc.signalingState !== 'stable'
      ) {
        return
      }

      ws.send(
        JSON.stringify({
          type: 'viewer-join',
          targetPeerId: WEBRTC_TARGET_PEER_ID,
        }),
      )
      streamControl.connectRequested = true
    }

    /**
     * Handles incoming WebRTC signaling messages from the remote peer,
     * including 'registered', 'offer', 'answer', 'ice-candidate', and 'error' messages,
     * to manage the WebRTC connection lifecycle and respond appropriately to connection events and errors.
     * @param {MessageEvent} event - The incoming message event containing the WebRTC signaling message data.
     * @returns {Promise<void>} - A promise that resolves when the message has been handled.
     */
    const handler = async (event: MessageEvent): Promise<void> => {
      streamControl.lastMessageAt = Date.now()
      const msg = parseWebRtcMessage(event.data)
      if (!msg) {
        return
      }

      try {
        switch (msg.type) {
          case 'connected':
          case 'pong':
            break

          case 'ping':
            break

          case 'registered':
            if (msg.peerId === streamControl.peerId) {
              streamControl.isRegistered = true
              requestOffer()
            }
            break

          case 'error':
            if (msg.code === 'TARGET_NOT_FOUND') {
              streamControl.connectRequested = false
              if (offerRetryTimer != null) {
                window.clearTimeout(offerRetryTimer)
              }
              offerRetryTimer = window.setTimeout(() => {
                offerRetryTimer = null
                requestOffer()
              }, OFFER_RETRY_DELAY_MS)
            }
            break

          case 'offer': {
            if (
              isHandlingOffer ||
              pc.signalingState !== 'stable' ||
              pc.connectionState === 'connected' ||
              pc.connectionState === 'connecting'
            ) {
              break
            }

            isHandlingOffer = true
            remotePeerId = msg.peerId
            streamControl.connectRequested = true

            await pc.setRemoteDescription({
              type: 'offer',
              sdp: msg.sdp,
            })

            while (pendingIceCandidates.length > 0) {
              const entry = pendingIceCandidates.shift()
              if (entry && entry.peerId === remotePeerId) {
                await pc.addIceCandidate(entry.candidate)
              }
            }

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            if (ws.readyState === WebSocket.OPEN && pc.localDescription?.sdp) {
              ws.send(
                safeJsonStringify({
                  type: 'answer',
                  sdp: pc.localDescription.sdp,
                  targetPeerId: msg.peerId,
                }) || '',
              )
            }
            isHandlingOffer = false
            break
          }

          case 'answer':
            if (pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription({
                type: 'answer',
                sdp: msg.sdp,
              })
            }
            break

          case 'ice-candidate': {
            if (msg.peerId && remotePeerId && msg.peerId !== remotePeerId) {
              break
            }

            const candidate = {
              candidate: msg.candidate,
              sdpMid: msg.mid ?? undefined,
            }

            if (!pc.remoteDescription) {
              if (msg.peerId) {
                pendingIceCandidates.push({ candidate, peerId: msg.peerId })
              }
              break
            }

            await pc.addIceCandidate(candidate)
            break
          }
        }
      } catch (error) {
        isHandlingOffer = false
        streamControl.connectRequested = false
        console.error('Failed to handle WebRTC signaling message', error)
      }
    }

    /**
     * Handle RTC connection
     */
    ws.addEventListener('message', handler)
    requestOffer()

    return () => {
      if (offerRetryTimer != null) {
        window.clearTimeout(offerRetryTimer)
      }
      ws.removeEventListener('message', handler)
    }
  }, [
    connectionControlsRef,
    connectionState.webrtc,
    getPeerConnection,
    websockets,
  ])

  return {
    cameraIds,
    latencyMetrics,
    pipelineMetrics,
    registerVideoElement,
    registerOverlayCanvas,
    shouldDrawOverlay,
  }
}
