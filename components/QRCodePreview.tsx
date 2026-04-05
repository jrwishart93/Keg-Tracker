"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodePreview({
  value,
  size = 220,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function generateQrCode() {
      try {
        const dataUrl = await QRCode.toDataURL(value, {
          margin: 1,
          width: size,
          color: {
            dark: "#131E29",
            light: "#FFFFFF",
          },
        });

        if (!cancelled) {
          setSrc(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setSrc("");
        }
      }
    }

    void generateQrCode();

    return () => {
      cancelled = true;
    };
  }, [size, value]);

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 ${className}`}
        style={{ width: size, height: size }}
      >
        Generating QR…
      </div>
    );
  }

  return <Image src={src} alt={`QR code for ${value}`} width={size} height={size} unoptimized className={className} />;
}
