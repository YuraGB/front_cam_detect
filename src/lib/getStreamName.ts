import type { StreamType, StreamURL } from "#/constants";

const getStreamName = (streamUrl: StreamURL): StreamType => {
 const streamName: StreamType | null = new URL(streamUrl).searchParams.get("type")
  if (!streamName) {
    throw new Error(`Invalid stream URL: ${streamUrl}`);
  }
  
  return streamName;
}

export { getStreamName }