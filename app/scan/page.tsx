"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QRScanner } from "@/components/QRScanner";
import { getKegByQr } from "@/lib/firestore";

export default function ScanPage() {
  const [message, setMessage] = useState("Ready to scan kegs.");
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const router = useRouter();

  async function handleScan(value: string) {
    const keg = await getKegByQr(value);
    if (keg) {
      router.push(`/kegs/${keg.id}/action`);
      return;
    }
    setMessage("Keg not found. Allocate it first from the Kegs screen and then print its sticker.");
    setScannerEnabled(false);
  }

  return (
    <main className="page-shell space-y-5">
      <section className="editorial-panel editorial-panel--dark grain-overlay relative overflow-hidden">
        <div className="relative h-44 w-full">
          <Image
            src="https://beffect.nz/cdn/shop/files/201116_MCH0001-2-scaled-1.webp?v=1670274003&width=535"
            alt="Brewery header"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131E29]/86 to-[#131E29]/38" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
            <p className="eyebrow text-amber-100/78">Scan Workflow</p>
            <h1 className="mt-3 text-5xl font-semibold">Scan Keg</h1>
            <p className="mt-2 text-sm text-slate-100/84">Point the camera at a saved keg QR code and jump straight into the action form.</p>
          </div>
        </div>
      </section>

      <section className="editorial-panel p-5 sm:p-6">
        <p className="section-kicker">Scanner Status</p>
        <p className="mt-3 text-base leading-7 text-slate-700">{message}</p>
        <button
          type="button"
          className="glow-button mt-5 min-h-13 w-full rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-4 text-base font-semibold text-white"
          onClick={() => {
            setMessage("Point camera at keg QR code.");
            setScannerEnabled((prev) => !prev);
          }}
        >
          {scannerEnabled ? "Stop Scan" : "Start Scan"}
        </button>
      </section>

      <QRScanner onScan={handleScan} enabled={scannerEnabled} />
    </main>
  );
}
