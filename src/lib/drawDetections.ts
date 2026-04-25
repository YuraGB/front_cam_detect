export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  bbox: BBox;
  label: string;
  confidence: number;
}

type DrawDetectionOverlayOptions = {
  sourceWidth: number;
  sourceHeight: number;
};

function drawDetections(
  canvas: HTMLCanvasElement,
  detections: Detection[],
  sourceWidth?: number,
  sourceHeight?: number
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx || detections.length === 0) return;

  const scaleX = canvas.width / (sourceWidth || 1);
  const scaleY = canvas.height / (sourceHeight || 1);

  detections.forEach((det) => {
    const { x, y, width: bboxWidth, height: bboxHeight } = det.bbox;

    const sx = x * scaleX;
    const sy = y * scaleY;
    const sw = bboxWidth * scaleX;
    const sh = bboxHeight * scaleY;

    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    const label = `${det.label} ${(det.confidence * 100).toFixed(1)}%`;
    ctx.font = "16px Arial";
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(sx, sy - 20, textWidth + 6, 20);

    ctx.fillStyle = "lime";
    ctx.fillText(label, sx + 3, sy - 5);
  });
}

function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawDetectionsOverlay(
  canvas: HTMLCanvasElement,
  detections: Detection[],
  { sourceWidth, sourceHeight }: DrawDetectionOverlayOptions
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cssWidth = canvas.clientWidth || sourceWidth || 1;
  const cssHeight = canvas.clientHeight || sourceHeight || 1;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const nextWidth = Math.max(1, Math.round(cssWidth * devicePixelRatio));
  const nextHeight = Math.max(1, Math.round(cssHeight * devicePixelRatio));

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }

  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  if (detections.length === 0 || sourceWidth <= 0 || sourceHeight <= 0) {
    return;
  }

  const scaleX = cssWidth / sourceWidth;
  const scaleY = cssHeight / sourceHeight;
  const fontSize = Math.max(12, Math.round(Math.min(cssWidth, cssHeight) * 0.02));
  const lineWidth = Math.max(2, Math.round(fontSize * 0.14));

  ctx.font = `${fontSize}px Arial`;
  ctx.textBaseline = "top";

  detections.forEach((det) => {
    const { x, y, width, height } = det.bbox;
    const sx = x * scaleX;
    const sy = y * scaleY;
    const sw = width * scaleX;
    const sh = height * scaleY;

    ctx.strokeStyle = "#7CFC00";
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(sx, sy, sw, sh);

    const label = `${det.label} ${(det.confidence * 100).toFixed(1)}%`;
    const textWidth = ctx.measureText(label).width;
    const labelHeight = fontSize + 6;
    const labelTop = Math.max(0, sy - labelHeight);

    ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
    ctx.fillRect(sx, labelTop, textWidth + 10, labelHeight);

    ctx.fillStyle = "#7CFC00";
    ctx.fillText(label, sx + 5, labelTop + 3);
  });
}

export { clearCanvas, drawDetections, drawDetectionsOverlay };
