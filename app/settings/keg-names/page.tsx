import { KegNameSettingsForm } from "@/components/KegNameSettingsForm";

export default function KegNameSettingsPage() {
  return (
    <main className="page-shell space-y-5">
      <div className="editorial-panel p-5 sm:p-6">
        <p className="section-kicker">Shared Name Pool</p>
        <h1 className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">Keg Name Pool</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Manage the shared pool of keg names used when allocating new QR sticker identities.
        </p>
      </div>
      <KegNameSettingsForm />
    </main>
  );
}
