import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">Admin</h1>
      <ul className="list-disc space-y-2 pl-5 text-slate-700">
        <li>Manage users and roles</li>
        <li>Manage beer/product templates</li>
        <li>Export movements as CSV</li>
      </ul>
      <div className="flex flex-wrap gap-3">
        <Link href="/kegs/new" className="inline-flex min-h-12 items-center rounded-lg bg-[#131E29] px-5 font-semibold text-white">
          Allocate a keg sticker
        </Link>
        <Link href="/settings/keg-names" className="inline-flex min-h-12 items-center rounded-lg border border-slate-300 px-5 font-semibold text-slate-700">
          Manage keg names
        </Link>
      </div>
    </main>
  );
}
