// index.jsx
import { useEffect, useRef } from 'react';

function Canvas({streamType}: {streamType: string}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current as HTMLCanvasElement;

    if (!canvas) return;    
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Підключаємося до WebSocket
    wsRef.current = new WebSocket(streamType);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
    
      try {
        const data = JSON.parse(event.data);   

        if(!data.image_base64) return;
        if(!data.camera_id) return;
        if(!canvas.id) canvas.id = data.camera_id;
        if(data.camera_id !== canvas.id) return; 
        
        const img = new Image();
        img.src = `data:image/png;base64,${data.image_base64}`;

        img.onload = () => {
          const { offsetX, offsetY, drawWidth, drawHeight } =
              drawImageContain(ctx, img, canvas);

          const scaleX = drawWidth / img.width;
          const scaleY = drawHeight / img.height;

          drawDetections(
              data.detections,
              ctx,
              scaleX,
              scaleY,
              offsetX,
              offsetY
          );
      };
        
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error', error);
    }

    return () => {
      wsRef.current?.close();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <h1>Canvas Video Stream</h1>
      <canvas
        ref={canvasRef}
        width={720}
        height={720}
        style={{ border: '1px solid black' }}
      />
    
    </div>
  );
}

export default Canvas;

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Detection {
  bbox: BBox;
  label: string;
  confidence: number;
}

function drawDetections(
  detections: Detection[],
  ctx: CanvasRenderingContext2D,
  scaleX: number,
  scaleY: number,
  offsetX: number,
  offsetY: number
): void {
  detections.forEach((det: Detection) => {
    const { x, y, width, height } = det.bbox;

    const sx = x * scaleX + offsetX;
    const sy = y * scaleY + offsetY;
    const sw = width * scaleX;
    const sh = height * scaleY;

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

function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement) {
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth, drawHeight;

    if (imgRatio > canvasRatio) {
        // обмеження по ширині
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
    } else {
        // обмеження по висоті
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
    }

    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    // очистка
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // (опційно) чорний фон
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // малюємо з правильними пропорціями
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    return { offsetX, offsetY, drawWidth, drawHeight };
}