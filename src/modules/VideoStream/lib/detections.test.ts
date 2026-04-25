import { describe, expect, it } from "vitest";
import { parseRtcDataMessage } from "./detections";

describe("parseRtcDataMessage", () => {
  it("parses detection payload from rtc data channel message", async () => {
    const payload = JSON.stringify({
      camera_id: "camera_0",
      detections: [
        {
          bbox: { x: 62, y: 189, width: 9, height: 15 },
          confidence: 0.2798135280609131,
          label: "person",
        },
      ],
      timestamp: 15.704,
    });

    await expect(parseRtcDataMessage(payload)).resolves.toEqual({
      type: "detection_frame",
      cameraId: "camera_0",
      detections: [
        {
          bbox: { x: 62, y: 189, width: 9, height: 15 },
          confidence: 0.2798135280609131,
          label: "person",
        },
      ],
      timestamp: 15.704,
    });
  });

  it("parses track map payload for multi-camera streams", async () => {
    const payload = JSON.stringify({
      type: "track_map",
      tracks: [
        { mid: "cam_camera_0", camera_id: "camera_0" },
        { mid: "cam_video_0", camera_id: "video_0" },
      ],
    });

    await expect(parseRtcDataMessage(payload)).resolves.toEqual({
      type: "track_map",
      tracks: [
        { mid: "cam_camera_0", cameraId: "camera_0" },
        { mid: "cam_video_0", cameraId: "video_0" },
      ],
    });
  });

  it("drops malformed detections but keeps valid frame envelope", async () => {
    const payload = JSON.stringify({
      camera_id: "camera_1",
      detections: [{ bbox: { x: 1 }, label: 42, confidence: "bad" }],
      timestamp: 10,
    });

    await expect(parseRtcDataMessage(payload)).resolves.toEqual({
      type: "detection_frame",
      cameraId: "camera_1",
      detections: [],
      timestamp: 10,
    });
  });

  it("returns null for invalid json", async () => {
    await expect(parseRtcDataMessage("{bad json")).resolves.toBeNull();
  });
});
