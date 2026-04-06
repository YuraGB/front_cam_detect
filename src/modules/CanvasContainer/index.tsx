import type { StreamType } from "#/constants";
import { useCanvasContainer } from "./hooks/useCanvasContainer";

const streamTitles: Record<StreamType, string> = {
  liveStream: "Live Stream",
  detectionStream: "Detection Stream",
};

const streamOrder: StreamType[] = ["liveStream", "detectionStream"];

export const CanvasContainer = () => {
  const { cameras, registerCanvas, streamStats, connectionState } = useCanvasContainer();

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <h1>Canvas Video Stream</h1>
      {cameras.map((cameraId) => {
        return (
          <div key={cameraId} style={{ marginBottom: 40 }}>
            <h2>Camera ID: {cameraId}</h2>

            {streamOrder.map((streamName) => {
              const stats = (streamStats[cameraId] ?? {})[streamName];
              const status = connectionState[streamName];

              return (
                <section key={`${cameraId}-${streamName}`} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      width: "min(100%, 960px)",
                      margin: "0 auto 8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    <strong>{streamTitles[streamName]}</strong>
                    <span>
                      {status} | FPS: {stats?.fps ?? 0} | Rendered: {stats?.rendered ?? 0} | Dropped: {stats?.dropped ?? 0} | Draw: {stats?.decodeMs ?? 0}ms | Latency: {stats?.latencyMs ?? "-"}ms
                    </span>
                  </div>
                  <canvas
                    ref={(el) => registerCanvas(cameraId, streamName, el)}
                    style={{
                      width: "min(100%, 960px)",
                      height: "auto",
                      display: "block",
                      margin: "0 auto",
                      background: "#000",
                    }}
                  />
                </section>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
