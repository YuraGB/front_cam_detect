import { afterEach, describe, expect, it, vi } from "vitest";
import { formatBufferData } from "./utilFunctions";

const textEncoder = new TextEncoder();

afterEach(() => {
  vi.restoreAllMocks();
});

const createFramePacket = (
  meta: Record<string, unknown>,
  payload: Uint8Array
): ArrayBuffer => {
  const metaBytes = textEncoder.encode(JSON.stringify(meta));
  const packet = new Uint8Array(4 + metaBytes.byteLength + payload.byteLength);
  new DataView(packet.buffer).setUint32(0, metaBytes.byteLength, false);
  packet.set(metaBytes, 4);
  packet.set(payload, 4 + metaBytes.byteLength);
  return packet.buffer;
};

describe("formatBufferData", () => {
  it("extracts metadata and jpeg payload from websocket frame", () => {
    const frame = createFramePacket(
      {
        cameraId: "camera-main",
        timestamp: 1710000000000,
        detections: [
          {
            label: "person",
            confidence: 0.92,
            bbox: { x: 1, y: 2, width: 3, height: 4 },
          },
        ],
      },
      new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
    );

    const parsed = formatBufferData({ data: frame }, { debugLabel: "test" });

    expect(parsed.cameraId).toBe("camera-main");
    expect(parsed.timestamp).toBe(1710000000000);
    expect(parsed.detections).toHaveLength(1);
    expect(parsed.imageType).toBe("image/jpeg");
    expect(parsed.imageBytes.byteLength).toBe(4);
  });

  it("returns empty frame payload for invalid packets", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const parsed = formatBufferData(
      { data: new Uint8Array([0x01, 0x02, 0x03]).buffer },
      { debugLabel: "bad-frame" }
    );

    expect(parsed.cameraId).toBe("");
    expect(parsed.imageBytes.byteLength).toBe(0);
    expect(parsed.detections).toEqual([]);
    expect(parsed.timestamp).toBeNull();
  });
});
