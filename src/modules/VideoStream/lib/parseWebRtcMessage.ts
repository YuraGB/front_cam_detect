import type { WebRtcMessage } from "#/types";

const parseWebRtcMessage = (data: unknown): WebRtcMessage | null => {
    if (typeof data !== "string") {
        return null;
    }

    try {
        return JSON.parse(data) as WebRtcMessage;
    } catch {
        return null;
    }
};

export default parseWebRtcMessage;