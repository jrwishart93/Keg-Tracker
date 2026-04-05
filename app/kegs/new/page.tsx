import { AllocateKegForm } from "@/components/AllocateKegForm";

export default function NewKegPage() {
  return (
    <main className="page-shell space-y-5">
      <div className="editorial-panel p-5 sm:p-6">
        <p className="section-kicker">Sticker Allocation</p>
        <h1 className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">Allocate Keg</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Generate a unique keg identity, create its QR code, and capture the first location details before the sticker goes on.
        </p>
      </div>
      <AllocateKegForm />
    </main>
  );
}
