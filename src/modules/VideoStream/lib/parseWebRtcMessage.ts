import { safeJsonParse } from '#/lib/asyncActionHandler'
import type { WebRtcMessage } from '#/types'

const parseWebRtcMessage = (data: unknown): WebRtcMessage | null => {
  if (typeof data !== 'string') {
    return null
  }

  return safeJsonParse(data)
}

export default parseWebRtcMessage
