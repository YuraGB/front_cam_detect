
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


function drawDetections(
  canvas: HTMLCanvasElement,
  detections: Detection[],
  width?: number ,
  height?: number
) {

  const ctx = canvas.getContext("2d");
  if (!ctx || !detections?.length) return;

  // Масштабування по canvas
  const scaleX = canvas.width / (width || 1);
  const scaleY = canvas.height / (height || 1);

  detections.forEach((det) => {
    const { x, y, width, height } = det.bbox;

    const sx = x * scaleX;
    const sy = y * scaleY;
    const sw = width * scaleX;
    const sh = height * scaleY;

    // Контур bbox
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    // Label
    const label = `${det.label} ${(det.confidence * 100).toFixed(1)}%`;
    ctx.font = "16px Arial";
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(sx, sy - 20, textWidth + 6, 20);

    ctx.fillStyle = "lime";
    ctx.fillText(label, sx + 3, sy - 5);
  });
}

export { drawDetections }