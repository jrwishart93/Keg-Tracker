export default function AdminPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">Admin</h1>
      <ul className="list-disc space-y-2 pl-5 text-slate-700">
        <li>Manage users and roles</li>
        <li>Manage beer/product templates</li>
        <li>Export movements as CSV</li>
      </ul>
    </main>
  );
}
