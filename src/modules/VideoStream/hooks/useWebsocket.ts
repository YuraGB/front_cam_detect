import type { StreamType } from '#/constants'
import { authClient } from '#/modules/Auth/betterAuthClient/auth-client'
import type { StreamHealth } from '#/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createWebsocketRuntime,
  shutdownWebsocketRuntime,
  startWebsocketRuntime,
} from '../lib/websocketConnection'
import type { WebsocketRuntime } from '../lib/websocketConnection'
import { emptyConnectionState } from '../lib/utils'

export const useWebsocket = () => {
  const [connectionState, setConnectionState] =
    useState<Record<StreamType, StreamHealth>>(emptyConnectionState)
  const [runtime] = useState<WebsocketRuntime>(() => createWebsocketRuntime())
  const websocketsRef = useRef(runtime.websockets)
  const connectionControlsRef = useRef(runtime.connectionControls)

  const { data: session, error: authError } = authClient.useSession()
  const isAuthenticated = Boolean(session) && !authError

  const updateConnectionState = useCallback(
    (streamName: StreamType, status: StreamHealth): void => {
      setConnectionState((prev) => {
        if (prev[streamName] === status) return prev

        return {
          ...prev,
          [streamName]: status,
        }
      })
    },
    [],
  )

  useEffect(() => {
    if (!isAuthenticated) {
      shutdownWebsocketRuntime(runtime, { updateConnectionState })
      return
    }

    return startWebsocketRuntime(runtime, { updateConnectionState })
  }, [isAuthenticated, runtime, updateConnectionState])

  return {
    connectionState,
    websockets: websocketsRef,
    connectionControlsRef,
  }
}
