"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QRScanner } from "@/components/QRScanner";
import { getKegByQr } from "@/lib/firestore";

export default function ScanPage() {
  const [message, setMessage] = useState("Ready to scan keg barcode.");
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const router = useRouter();

  async function handleScan(value: string) {
    const keg = await getKegByQr(value);
    if (keg) {
      router.push(`/kegs/${keg.id}/action`);
      return;
    }
    setMessage("Keg not found. Register this keg in admin tools.");
    setScannerEnabled(false);
  }

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">Scan Keg Barcodes</h1>
      <p className="text-sm text-slate-600">{message}</p>
      <button
        type="button"
        className="min-h-12 w-full rounded-xl bg-slate-900 px-4 text-lg font-semibold text-white"
        onClick={() => {
          setMessage("Point camera at keg QR code.");
          setScannerEnabled((prev) => !prev);
        }}
      >
        {scannerEnabled ? "Stop Scan" : "Scan"}
      </button>
      <QRScanner onScan={handleScan} enabled={scannerEnabled} />
    </main>
  );
}
