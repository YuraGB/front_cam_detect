# cam_frontend

Browser frontend for the camera WebRTC stack.

The app connects to the Bun signaling server, negotiates a native WebRTC session with the C++ camera service, renders live H264 video tracks, draws YOLO detections on canvas overlays, and displays live capture-to-render latency estimates.

## Run

```bash
npm install
npm run dev
```

Default dev URL:

```text
http://localhost:3000
```

Video route:

```text
/video_stream
```

## Build And Checks

```bash
npm run build
npm run test
npm run lint
```

Current note: `npx tsc --noEmit` may fail on the existing `/demo/better-auth` route typing issue. The VideoStream files can be checked directly with ESLint.

## WebRTC Flow

The frontend uses one signaling WebSocket:

```text
ws://127.0.0.1:3001/ws?type=webrtc
```

Flow:

1. Open WebSocket to the signaling server.
2. Register a stable session peer id, such as `frontend-abc`.
3. Send `viewer-join` to `camera-cv-service`.
4. Receive an SDP `offer` from the C++ service.
5. Create and send an SDP `answer`.
6. Exchange `ice-candidate` messages.
7. Receive live video tracks and the `detectionStream` DataChannel.

Important constants live in [src/constants/index.ts](/D:/Projects/cam_frontend/cam_frontend/src/constants/index.ts).

## Video Rendering

The main route is implemented by:

- [VideoStream index.tsx](/D:/Projects/cam_frontend/cam_frontend/src/modules/VideoStream/index.tsx)
- [useStreams.ts](/D:/Projects/cam_frontend/cam_frontend/src/modules/VideoStream/hooks/useStreams.ts)
- [usePc.ts](/D:/Projects/cam_frontend/cam_frontend/src/modules/VideoStream/hooks/usePc.ts)
- [CameraStreamView.tsx](/D:/Projects/cam_frontend/cam_frontend/src/modules/VideoStream/components/CameraStreamView.tsx)
- [LatencyBadge.tsx](/D:/Projects/cam_frontend/cam_frontend/src/modules/VideoStream/components/LatencyBadge.tsx)

Each camera gets:

- a `<video>` element for the native WebRTC media track
- a canvas overlay for detections
- a memoized latency badge

The stream item and latency badge are split into memoized components so metric updates do not rebind the video element or reset `srcObject`.

## DataChannel Payloads

The C++ service sends DataChannel messages on `detectionStream`.

Detection frame:

```json
{
  "type": "detection_frame",
  "camera_id": "camera_0",
  "timestamp": 12.533,
  "detections": [
    {
      "label": "person",
      "confidence": 0.92,
      "bbox": {
        "x": 120,
        "y": 48,
        "width": 210,
        "height": 390
      }
    }
  ]
}
```

Track map:

```json
{
  "type": "track_map",
  "tracks": [
    {
      "mid": "cam_camera_0",
      "camera_id": "camera_0"
    }
  ]
}
```

Live video latency sample:

```json
{
  "type": "video_latency_sample",
  "camera_id": "camera_0",
  "frame_id": 12345,
  "capture_timestamp_ms": 1715000000000,
  "encoded_timestamp_ms": 1715000000024,
  "sample_interval_ms": 1000
}
```

Parsing lives in [detections.ts](/D:/Projects/cam_frontend/cam_frontend/src/modules/VideoStream/lib/detections.ts).

## Latency Metrics

Latency measurement is intentionally separate from YOLO detection timing.

The C++ service timestamps frames when they enter the live video pipeline, then sends throttled `video_latency_sample` messages. The frontend stores the latest sample per camera and uses `HTMLVideoElement.requestVideoFrameCallback()` to measure when a rendered video frame reaches the browser compositor.

The displayed value is:

```text
browser display epoch ms - C++ capture_timestamp_ms
```

This is a practical capture-to-render estimate. It is best when the C++ service and frontend run on machines with synchronized clocks. On one machine, the measurement is usually good enough for tuning live latency.

The latency hook lives in [useVideoLatencyMetrics.ts](/D:/Projects/cam_frontend/cam_frontend/src/modules/VideoStream/hooks/useVideoLatencyMetrics.ts).

## Styling And Routing

The app uses:

- TanStack Start / TanStack Router
- React
- Tailwind CSS
- Paraglide i18n generated files

Routes live in [src/routes](/D:/Projects/cam_frontend/cam_frontend/src/routes).

## Related Services

- C++ camera service: `E:\Progects\test\camera_cv_service`
- Signaling server: `D:\Projects\cam_serv`
