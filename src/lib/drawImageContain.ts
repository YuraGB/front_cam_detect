export function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement) {
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

