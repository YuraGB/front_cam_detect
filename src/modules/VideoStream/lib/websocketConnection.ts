import {
  HEARTBEAT_INTERVAL_MS,
  RECONNECT_BASE_DELAY_MS,
  RECONNECT_MAX_DELAY_MS,
  STREAM_INACTIVITY_TIMEOUT_MS,
  STREAM_URLS,
} from '#/constants'
import type { StreamType, StreamURL } from '#/constants'
import { logger } from '#/lib/frontend_logger'
import { createSocket } from '#/modules/VideoStream/lib/utilFunctions'
import type { StreamConnectionControl, StreamHealth } from '#/types'
import { createStreamControl, getStablePeerId } from './utils'

type WebsocketRegistry = Partial<Record<StreamType, WebSocket>>
type ConnectionControls = Record<StreamType, StreamConnectionControl>

type WebsocketRuntime = {
  websockets: WebsocketRegistry
  connectionControls: ConnectionControls
  isDisposed: boolean
}

type RuntimeOptions = {
  updateConnectionState: (streamName: StreamType, status: StreamHealth) => void
}

const createConnectionControls = (): ConnectionControls => ({
  liveStream: createStreamControl(),
  detectionStream: createStreamControl(),
  fileFrames: createStreamControl(),
  webrtc: createStreamControl(),
})

const createWebsocketRuntime = (): WebsocketRuntime => ({
  websockets: {},
  connectionControls: createConnectionControls(),
  isDisposed: false,
})

const clearConnectionTimers = (control: StreamConnectionControl): void => {
  if (control.reconnectTimer !== null) {
    window.clearTimeout(control.reconnectTimer)
    control.reconnectTimer = null
  }

  if (control.heartbeatTimer !== null) {
    window.clearInterval(control.heartbeatTimer)
    control.heartbeatTimer = null
  }
}

const shutdownWebsocketRuntime = (
  runtime: WebsocketRuntime,
  options?: RuntimeOptions,
): void => {
  runtime.isDisposed = true

  Object.entries(runtime.websockets).forEach(([streamName, socket]) => {
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      logger.info('[WS] cleanup close', {
        url: socket.url,
        readyState: socket.readyState,
      })
      socket.close()
    }

    options?.updateConnectionState(streamName as StreamType, 'disconnected')
  })

  Object.values(runtime.connectionControls).forEach(clearConnectionTimers)
}

const scheduleCreateRetry = (
  streamUrl: StreamURL,
  runtime: WebsocketRuntime,
  connectStream: (streamUrl: StreamURL) => Promise<void>,
): void => {
  window.setTimeout(() => {
    if (runtime.isDisposed) {
      return
    }

    void connectStream(streamUrl)
  }, RECONNECT_BASE_DELAY_MS)
}

const registerSocketPeer = (
  socket: WebSocket,
  streamName: StreamType,
  streamControl: StreamConnectionControl,
): void => {
  const peerId = streamControl.peerId ?? getStablePeerId(streamName)
  streamControl.peerId = peerId

  socket.send(
    JSON.stringify({
      type: 'register',
      peerId,
    }),
  )
  streamControl.isRegistered = true
}

const startHeartbeat = (
  streamName: StreamType,
  streamControl: StreamConnectionControl,
  { updateConnectionState }: RuntimeOptions,
): void => {
  if (streamControl.heartbeatTimer !== null) {
    window.clearInterval(streamControl.heartbeatTimer)
  }

  streamControl.heartbeatTimer = window.setInterval(() => {
    if (streamName === 'webrtc') return

    const now = Date.now()
    if (now - streamControl.lastMessageAt > STREAM_INACTIVITY_TIMEOUT_MS) {
      updateConnectionState(streamName, 'stalled')
      streamControl.ws?.close()
    }
  }, HEARTBEAT_INTERVAL_MS)
}

const attachSocketHandlers = ({
  socket,
  streamName,
  streamUrl,
  attemptNumber,
  runtime,
  connectStream,
  options,
}: {
  socket: WebSocket
  streamName: StreamType
  streamUrl: StreamURL
  attemptNumber: number
  runtime: WebsocketRuntime
  connectStream: (streamUrl: StreamURL) => Promise<void>
  options: RuntimeOptions
}): void => {
  const streamControl = runtime.connectionControls[streamName]
  const isCurrentSocket = () => streamControl.ws === socket
  const { updateConnectionState } = options

  socket.onopen = () => {
    if (!isCurrentSocket()) {
      logger.info('[WS] ignoring open from stale socket', {
        streamName,
        streamUrl,
        attemptNumber,
      })
      socket.close()
      return
    }

    logger.info('[WS] open', {
      streamName,
      streamUrl,
      attemptNumber,
    })
    streamControl.reconnectAttempt = 0
    streamControl.lastMessageAt = Date.now()

    updateConnectionState(streamName, 'connected')
    startHeartbeat(streamName, streamControl, options)
    registerSocketPeer(socket, streamName, streamControl)
  }

  socket.onerror = () => {
    if (!isCurrentSocket()) {
      logger.info('[WS] ignoring error from stale socket', {
        streamName,
        streamUrl,
        attemptNumber,
        readyState: socket.readyState,
      })
      return
    }

    logger.warn('[WS] error', {
      streamName,
      streamUrl,
      attemptNumber,
      readyState: socket.readyState,
    })
    updateConnectionState(streamName, 'reconnecting')
    clearConnectionTimers(streamControl)
  }

  socket.onclose = (event) => {
    if (!isCurrentSocket()) {
      logger.info('[WS] ignoring close from stale socket', {
        streamName,
        streamUrl,
        attemptNumber,
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      })
      return
    }

    logger.warn('[WS] close', {
      streamName,
      streamUrl,
      attemptNumber,
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      disposed: runtime.isDisposed,
    })

    if (streamControl.heartbeatTimer !== null) {
      window.clearInterval(streamControl.heartbeatTimer)
      streamControl.heartbeatTimer = null
    }

    if (runtime.isDisposed) {
      updateConnectionState(streamName, 'disconnected')
      return
    }

    if (event.code === 4001 && event.reason === 'peer replaced') {
      logger.warn(
        '[WS] peer replaced on current socket; waiting for active replacement instead of reconnecting',
        {
          streamName,
          streamUrl,
          attemptNumber,
        },
      )
      updateConnectionState(streamName, 'reconnecting')
      return
    }

    updateConnectionState(streamName, 'reconnecting')

    const reconnectDelay =
      Math.min(
        RECONNECT_MAX_DELAY_MS,
        RECONNECT_BASE_DELAY_MS * 2 ** streamControl.reconnectAttempt,
      ) + Math.floor(Math.random() * 250)

    streamControl.reconnectAttempt += 1

    if (streamControl.reconnectTimer !== null) {
      window.clearTimeout(streamControl.reconnectTimer)
    }

    logger.info('[WS] reconnect scheduled', {
      streamName,
      streamUrl,
      nextAttemptNumber: streamControl.reconnectAttempt + 1,
      reconnectDelay,
    })
    streamControl.reconnectTimer = window.setTimeout(() => {
      streamControl.reconnectTimer = null
      void connectStream(streamUrl)
    }, reconnectDelay)
  }
}

const connectStream = async (
  streamUrl: StreamURL,
  runtime: WebsocketRuntime,
  options: RuntimeOptions,
): Promise<void> => {
  if (runtime.isDisposed) {
    return
  }

  let socket: WebSocket
  let streamName: StreamType

  try {
    ;({ socket, streamName } = await createSocket(streamUrl))
  } catch (error) {
    logger.error('[WS] create failed', { streamUrl, error })
    scheduleCreateRetry(streamUrl, runtime, (nextStreamUrl) =>
      connectStream(nextStreamUrl, runtime, options),
    )
    return
  }

  const streamControl = runtime.connectionControls[streamName]
  const attemptNumber = streamControl.reconnectAttempt + 1

  streamControl.ws = socket
  streamControl.isRegistered = false
  streamControl.connectRequested = false
  if (!streamControl.peerId) {
    streamControl.peerId = getStablePeerId(streamName)
  }
  runtime.websockets[streamName] = socket

  logger.info('[WS] create', {
    streamName,
    streamUrl,
    attemptNumber,
  })

  options.updateConnectionState(
    streamName,
    streamControl.reconnectAttempt > 0 ? 'reconnecting' : 'connecting',
  )

  attachSocketHandlers({
    socket,
    streamName,
    streamUrl,
    attemptNumber,
    runtime,
    connectStream: (nextStreamUrl) =>
      connectStream(nextStreamUrl, runtime, options),
    options,
  })
}

const startWebsocketRuntime = (
  runtime: WebsocketRuntime,
  options: RuntimeOptions,
): (() => void) => {
  runtime.isDisposed = false

  STREAM_URLS.forEach((url) => {
    void connectStream(url, runtime, options)
  })

  return () => {
    shutdownWebsocketRuntime(runtime)
  }
}

export {
  createWebsocketRuntime,
  shutdownWebsocketRuntime,
  startWebsocketRuntime,
}
export type { WebsocketRuntime }
