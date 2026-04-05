"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Beer, LayoutDashboard, MapPinned, ScanLine } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scan", label: "Scan" },
  { href: "/kegs", label: "Kegs" },
  { href: "/locations", label: "Locations" },
];

const hiddenRoutes = new Set(["/", "/login", "/change-password"]);

function NavIcon({ label }: { label: string }) {
  const className = "h-[18px] w-[18px]";

  switch (label) {
    case "Dashboard":
      return <LayoutDashboard className={className} strokeWidth={1.8} />;
    case "Scan":
      return <ScanLine className={className} strokeWidth={1.8} />;
    case "Kegs":
      return <Beer className={className} strokeWidth={1.8} />;
    default:
      return <MapPinned className={className} strokeWidth={1.8} />;
  }
}

export function BottomNav() {
  const pathname = usePathname();

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 md:hidden">
      <ul className="floating-dock mx-auto grid max-w-md grid-cols-4 gap-2 rounded-[26px] p-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] px-2 text-[11px] font-semibold tracking-[0.14em] uppercase ${
                  active
                    ? "bg-gradient-to-br from-[#d79954] via-[#be7c38] to-[#8a5b2d] text-white shadow-[0_16px_28px_rgba(190,124,56,0.32)]"
                    : "text-slate-200 hover:bg-[rgba(255,255,255,0.08)]"
                }`}
              >
                <NavIcon label={link.label} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
