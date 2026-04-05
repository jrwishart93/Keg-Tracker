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
    setMessage("Keg not found. Register this keg in admin tools.");
    setScannerEnabled(false);
  }

  return (
    <main className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl">
        <div className="relative h-36 w-full">
          <Image
            src="https://beffect.nz/cdn/shop/files/201116_MCH0001-2-scaled-1.webp?v=1670274003&width=535"
            alt="Brewery header"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131E29]/85 to-[#131E29]/40" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
            <h1 className="text-3xl font-bold">Scan Keg</h1>
            <p className="text-sm text-slate-100">Point camera at keg QR code.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">{message}</p>
        <button
          type="button"
          className="mt-4 min-h-12 w-full rounded-xl bg-[#131E29] px-4 text-base font-semibold text-white"
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
