import { env } from '#/env'

export const WEBRTC_TARGET_PEER_ID =
  env.VITE_WEBRTC_TARGET_PEER_ID || 'camera-cv-service'
export const SIGNALING_SERVER_URL =
  env.VITE_SIGNALING_SERVER_URL || 'http://localhost:3002'
export const BETTER_AUTH_URL =
  env.VITE_BETTER_AUTH_URL || 'http://localhost:3000'

const ICE_SERVERS: RTCIceServer[] = (Array.isArray(env.VITE_ICE_SERVERS)
  ? env.VITE_ICE_SERVERS.map((iceServer) =>
      typeof iceServer === 'string' ? { urls: iceServer } : iceServer,
    )
  : undefined) ?? [{ urls: 'stun:stun.l.google.com:19302' }]

export const RTCPeerConnectionConfig: RTCConfiguration = {
  iceServers: ICE_SERVERS,
}
