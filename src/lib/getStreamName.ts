import type { StreamType, StreamURL } from "#/constants";

const getStreamName = (streamUrl: StreamURL): StreamType => {
  const url = new URL(streamUrl);
  const streamName = url.searchParams.get("type");
  const pathname = url.pathname.replace(/\/+$/, "");

  if (streamName === "liveStream" || streamName === "detectionStream") {
    return streamName;
  }

  if (streamName === "fileFrames" || pathname.endsWith("/file-frames")) {
    return "fileFrames";
  }

  throw new Error(`Invalid stream URL: ${streamUrl}`);
};

export { getStreamName }
