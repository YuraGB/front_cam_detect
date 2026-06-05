import type { StreamType } from '#/constants'
import { authClient } from '#/lib/auth-client'
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
  const runtimeRef = useRef<WebsocketRuntime | null>(null)

  if (!runtimeRef.current) {
    runtimeRef.current = createWebsocketRuntime()
  }
  const websocketsRef = useRef(runtimeRef.current.websockets)
  const connectionControlsRef = useRef(runtimeRef.current.connectionControls)

  const {
    data: session,
    error: authError,
  } = authClient.useSession()
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
    const runtime = runtimeRef.current
    if (!runtime || !isAuthenticated) {
      if (runtime) {
        shutdownWebsocketRuntime(runtime, { updateConnectionState })
      }
      return
    }

    return startWebsocketRuntime(runtime, { updateConnectionState })
  }, [isAuthenticated, updateConnectionState])

  return {
    connectionState,
    websockets: websocketsRef,
    connectionControlsRef,
  }
}
