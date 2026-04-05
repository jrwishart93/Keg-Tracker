"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const AUTH_ROUTES = new Set(["/login", "/change-password"]);

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    state: { user },
    signOut,
  } = useAuth();

  const isAuthRoute = AUTH_ROUTES.has(pathname);

  async function onLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#131E29] text-white">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Image
            src="https://beffect.nz/cdn/shop/files/Facebook-ProfileLogo-01_95.jpg?v=1671142822"
            alt="b.effect Brewing logo"
            width={34}
            height={34}
            className="rounded-full border border-white/20 object-cover"
          />
          <div>
            <p className="text-sm font-bold tracking-wide">b.effect</p>
            <p className="text-xs text-slate-300">Keg Tracker</p>
          </div>
        </div>

        {!isAuthRoute && user && (
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-100">{user.displayName}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-300">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
