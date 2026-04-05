"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

export function QRScanner({ onScan }: { onScan: (value: string) => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
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
  }, [onScan]);

  return <div id="reader" className="overflow-hidden rounded-xl border border-slate-200 bg-white" />;
}
