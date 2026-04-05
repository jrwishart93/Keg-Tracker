export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintStickerButton } from "@/components/PrintStickerButton";
import { QRCodePreview } from "@/components/QRCodePreview";
import { getKegById } from "@/lib/firestore";

export default async function KegLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const keg = await getKegById(id);

  if (!keg) {
    notFound();
  }

  return (
    <main className="space-y-4 print:bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-[#131E29]">Print Keg Sticker</h1>
          <p className="mt-1 text-sm text-slate-600">Use this label for the QR sticker attached to the keg.</p>
        </div>
        <div className="flex gap-2">
          <PrintStickerButton />
          <Link href={`/kegs/${keg.id}`} className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 px-5 font-semibold text-slate-700">
            Back To Keg
          </Link>
        </div>
      </div>

      <section className="print-sticker mx-auto max-w-md rounded-[2rem] border-4 border-[#131E29] bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:border-2 print:shadow-none">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">b.effect keg tracker</p>
          <h2 className="mt-3 text-3xl font-bold text-[#131E29]">{keg.kegId ?? keg.id}</h2>
          <p className="mt-2 text-sm text-slate-600">{keg.beerName ?? keg.product ?? "Contents not set yet"}</p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3">
            <QRCodePreview value={keg.qrCode} size={240} />
          </div>
          <div className="mt-5 grid w-full gap-3 text-left text-sm text-slate-700 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Current</p>
              <p className="mt-1 font-semibold">{keg.currentLocation}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Intended</p>
              <p className="mt-1 font-semibold">{keg.intendedLocation ?? "Not set"}</p>
            </div>
          </div>
          <p className="mt-4 text-[11px] tracking-[0.14em] text-slate-500">{keg.qrCode}</p>
        </div>
      </section>
    </main>
  );
}
