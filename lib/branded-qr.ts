"use client";

import QRCode from "qrcode";

const BRAND_LOGO_PATH = "/logo.jpg";

function loadLogo(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Logo could not be loaded."));
    image.src = src;
  });
}

export async function generateBrandedQr(canvas: HTMLCanvasElement, value: string, size = 300) {
  const pixelRatio = window.devicePixelRatio || 1;
  const renderSize = Math.round(size * pixelRatio);

  canvas.width = renderSize;
  canvas.height = renderSize;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  await QRCode.toCanvas(canvas, value, {
    errorCorrectionLevel: "H",
    width: renderSize,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context is unavailable.");
  }

  try {
    const logo = await loadLogo(BRAND_LOGO_PATH);
    const qrSize = canvas.width;
    const logoSize = Math.round(qrSize * 0.2);
    const padding = Math.max(Math.round(qrSize * 0.026), 8);
    const x = Math.round((qrSize - logoSize) / 2);
    const y = Math.round((qrSize - logoSize) / 2);

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#ffffff";
    context.fillRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2);
    context.drawImage(logo, x, y, logoSize, logoSize);
  } catch {
    // Keep the base QR code intact if the brand asset cannot be loaded.
  }
}
