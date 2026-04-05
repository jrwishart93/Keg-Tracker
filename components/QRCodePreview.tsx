"use client";

import { useEffect, useRef, useState } from "react";
import { generateBrandedQr } from "@/lib/branded-qr";

export function QRCodePreview({
  value,
  size = 220,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function generateQrCode() {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      setStatus("loading");

      try {
        await generateBrandedQr(canvas, value, size);
        if (!cancelled) {
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    void generateQrCode();

    return () => {
      cancelled = true;
    };
  }, [size, value]);

  return (
    <div className={className}>
      <div className="relative" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`QR code for ${value}`}
          className="block h-full w-full"
          style={{ visibility: status === "ready" ? "visible" : "hidden" }}
        />
        {status !== "ready" ? (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500"
          >
            {status === "error" ? "QR unavailable" : "Generating QR…"}
          </div>
        ) : null}
      </div>
    </div>
  );
}
