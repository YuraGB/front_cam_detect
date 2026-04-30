import { useStreams } from "./hooks/useStreams";

export const VideoStream = () => {
    const { cameraIds, registerVideoElement, registerOverlayCanvas } = useStreams();

    return (
        <div>
            <h1>Video Streams</h1>
            <div style={{ display: "grid", gap: 24 }}>
                {cameraIds.map((cameraId: string) => (
                    <section key={cameraId}>
                        <h2 style={{ marginBottom: 12 }}>{cameraId}</h2>
                        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
                            <video
                                ref={(element) => registerVideoElement(cameraId, element)}
                                autoPlay
                                playsInline
                                muted
                                controls
                                style={{ width: "100%", display: "block", background: "#000", position: "relative", zIndex: 0 }}
                            />
                            <canvas
                                ref={(element) => registerOverlayCanvas(cameraId, element)}
                                aria-hidden="true"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    pointerEvents: "none",
                                    zIndex: 1,
                                }}
                            />
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
