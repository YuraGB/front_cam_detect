import { useCanvasContainer } from "./hooks/useCanvasContainer"

export const CanvasContainer = () => {
  const { cameras, registerCanvas } = useCanvasContainer();
    return (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <h1>Canvas Video Stream</h1>
          {
            cameras.map((cameraId) => (
                <div key={cameraId} style={{ marginBottom: 40 }}>
                    <h2>Camera ID: {cameraId}</h2>
                    <canvas ref={(el) => registerCanvas(cameraId, "liveStream", el)} width={720} height={480} />
                    <canvas ref={(el) => registerCanvas(cameraId, "detectionStream", el)} width={720} height={480} />
                </div>
            ))}
        </div>
      );
}