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
    <nav className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-[#131E29]/95 p-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4 gap-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex min-h-11 items-center justify-center rounded-lg text-xs font-semibold tracking-wide ${
                  active ? "bg-[#2F4C3A] text-white" : "bg-white/10 text-slate-100"
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
