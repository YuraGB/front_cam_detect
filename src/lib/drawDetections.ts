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

type DrawDetectionsOptions = {
  drawLabels?: boolean;
  maxBoxes?: number;
};

const labelWidthCache = new Map<string, number>();

function drawDetections(
  canvas: HTMLCanvasElement,
  detections: Detection[],
  width: number = 1,
  height: number = 1,
  options?: DrawDetectionsOptions
) {
  const ctx = canvas.getContext("2d");
  if (!ctx || detections.length === 0) return;

  const drawLabels = options?.drawLabels ?? true;
  const maxBoxes = options?.maxBoxes ?? 80;

  const scaleX = canvas.width / width;
  const scaleY = canvas.height / height;
  const total = Math.min(detections.length, maxBoxes);

  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;
  ctx.font = "16px Arial";
  ctx.textBaseline = "top";

  for (let i = 0; i < total; i += 1) {
    const det = detections[i];
    const { x, y, width: boxWidth, height: boxHeight } = det.bbox;

    const sx = x * scaleX;
    const sy = y * scaleY;
    const sw = boxWidth * scaleX;
    const sh = boxHeight * scaleY;

    ctx.strokeRect(sx, sy, sw, sh);

    if (!drawLabels) {
      continue;
    }

    const label = `${det.label} ${(det.confidence * 100).toFixed(1)}%`;
    let textWidth = labelWidthCache.get(label);
    if (textWidth === undefined) {
      textWidth = ctx.measureText(label).width;
      labelWidthCache.set(label, textWidth);
    }

    const labelY = Math.max(0, sy - 20);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(sx, labelY, textWidth + 6, 20);

    ctx.fillStyle = "lime";
    ctx.fillText(label, sx + 3, labelY + 2);
  }
}

export { drawDetections };
