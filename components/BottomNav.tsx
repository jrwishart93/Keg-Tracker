"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scan", label: "Scan" },
  { href: "/kegs", label: "Kegs" },
  { href: "/locations", label: "Locations" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4 gap-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex min-h-11 items-center justify-center rounded-lg text-sm font-medium ${
                  active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
