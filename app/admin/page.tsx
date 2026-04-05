import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="page-shell space-y-5">
      <section className="editorial-panel editorial-panel--dark p-6">
        <p className="eyebrow text-amber-100/78">Admin Tools</p>
        <h1 className="mt-3 text-5xl font-semibold">Control tower for prototype operations.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-100/84">
          Keep the supporting pieces of the system tidy while the live tracking workflow continues to run on mobile and desktop.
        </p>
      </section>
      <section className="editorial-panel p-5">
        <ul className="stagger-list grid gap-3 text-slate-700 md:grid-cols-3">
          <li className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">Manage users and roles</li>
          <li className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">Manage beer and product templates</li>
          <li className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">Export movement data as CSV</li>
        </ul>
      </section>
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
