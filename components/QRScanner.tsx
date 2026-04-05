"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

export function QRScanner({
  onScan,
  enabled,
}: {
  onScan: (value: string) => void;
  enabled: boolean;
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          void scanner.stop();
        },
        () => undefined,
      )
      .catch(() => undefined);

    return () => {
      const current = scannerRef.current;
      if (current?.isScanning) {
        void current.stop();
      }
    };
  }, [enabled, onScan]);

  if (!enabled) {
    return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Tap Scan to open camera</div>;
  }

  return <div id="reader" className="overflow-hidden rounded-xl border border-slate-200 bg-white" />;
}
