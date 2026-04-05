import { AllocateKegForm } from "@/components/AllocateKegForm";

export default function NewKegPage() {
  return (
    <main className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-[#131E29]">Allocate Keg</h1>
        <p className="mt-1 text-sm text-slate-600">
          Generate a unique keg identity, create its QR code, and capture the first location details before the sticker goes on.
        </p>
      </div>
      <AllocateKegForm />
    </main>
  );
}
