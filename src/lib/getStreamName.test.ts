import { describe, expect, it } from "vitest";
import { getStreamName } from "./getStreamName";
import type { StreamURL } from "#/constants";

const asStreamUrl = (value: string): StreamURL => value as StreamURL;

describe("getStreamName", () => {
  it("parses stream type from query params", () => {
    expect(getStreamName(asStreamUrl("ws://127.0.0.1:3001/ws?type=webrtc"))).toBe("webrtc");
    expect(getStreamName(asStreamUrl("ws://localhost:3002/ws?type=liveStream"))).toBe("liveStream");
  });

  it("parses file frames from pathname", () => {
    expect(getStreamName(asStreamUrl("ws://localhost:3002/ws/file-frames"))).toBe("fileFrames");
  });

  it("throws on unsupported stream url", () => {
    expect(() => getStreamName(asStreamUrl("ws://localhost:3002/ws?type=unknown"))).toThrow(
      "Invalid stream URL"
    );
  });
});
