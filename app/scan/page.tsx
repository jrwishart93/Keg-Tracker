"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QRScanner } from "@/components/QRScanner";
import { getKegByQr } from "@/lib/firestore";

export default function ScanPage() {
  const [message, setMessage] = useState("Point camera at keg QR code.");
  const router = useRouter();

  async function handleScan(value: string) {
    const keg = await getKegByQr(value);
    if (keg) {
      router.push(`/kegs/${keg.id}/action`);
      return;
    }
    setMessage("Keg not found. Register this keg in admin tools.");
  }

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">Scan Keg</h1>
      <p className="text-sm text-slate-600">{message}</p>
      <QRScanner onScan={handleScan} />
    </main>
  );
}
