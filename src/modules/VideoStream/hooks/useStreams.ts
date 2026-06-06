import { useEffect } from 'react'
import { useWebsocket } from './useWebsocket'
import { usePc } from './usePc'
import parseWebRtcMessage from '../lib/parseWebRtcMessage'
import { OFFER_RETRY_DELAY_MS, WEBRTC_TARGET_PEER_ID } from '#/constants'
import { usePipelineMetrics } from './usePipelineMetrics'

export const useStreams = () => {
  const { connectionState, websockets, connectionControlsRef } = useWebsocket()
  const { pipelineMetrics, recordPipelineMetrics } = usePipelineMetrics()
  const {
    pcRef: { current: pc },
    cameraIds,
    latencyMetrics,
    registerVideoElement,
    registerOverlayCanvas,
  } = usePc(websockets.current.webrtc, {
    onPipelineMetrics: recordPipelineMetrics,
  })

  useEffect(() => {
    const ws = websockets.current.webrtc
    if (!ws || !pc || connectionState.webrtc !== 'connected') return
    const streamControl = connectionControlsRef.current.webrtc
    let offerRetryTimer: number | null = null

    /**
     * Requests an offer from the remote peer.
     * @returns
     */
    const requestOffer = () => {
      if (ws.readyState !== WebSocket.OPEN || streamControl.connectRequested) {
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
          case 'registered':
            requestOffer()
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
            await pc.setRemoteDescription({
              type: 'offer',
              sdp: msg.sdp,
            })

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'answer',
                  sdp: answer.sdp,
                  targetPeerId: msg.peerId,
                }),
              )
            }
            break
          }

          case 'answer':
            await pc.setRemoteDescription({
              type: 'answer',
              sdp: msg.sdp,
            })
            break

          case 'ice-candidate':
            await pc.addIceCandidate({
              candidate: msg.candidate,
              sdpMid: msg.mid,
            })
            break
        }
      } catch (error) {
        console.error('Failed to handle WebRTC signaling message', error)
      }
    }

    ws.addEventListener('message', handler)
    requestOffer()

    return () => {
      if (offerRetryTimer != null) {
        window.clearTimeout(offerRetryTimer)
      }
      ws.removeEventListener('message', handler)
    }
  }, [connectionControlsRef, connectionState.webrtc, pc, websockets])

  return {
    cameraIds,
    latencyMetrics,
    pipelineMetrics,
    registerVideoElement,
    registerOverlayCanvas,
  }
}
