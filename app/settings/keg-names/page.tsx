import { KegNameSettingsForm } from "@/components/KegNameSettingsForm";

export default function KegNameSettingsPage() {
  return (
    <main className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-[#131E29]">Keg Name Pool</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage the shared pool of keg names used when allocating new QR sticker identities.
        </p>
      </div>
      <KegNameSettingsForm />
    </main>
  );
}
