"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const AUTH_ROUTES = new Set(["/", "/login", "/change-password"]);

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    state: { user },
    signOut,
  } = useAuth();

  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isDemoUser = user?.role === "demo";

  async function onLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-[28px] border border-white/10 bg-[#16202AE6] px-4 py-3 text-white shadow-[0_20px_38px_rgba(9,12,16,0.18)] backdrop-blur-xl sm:px-5">
        <div className="flex items-center gap-3">
          <Image
            src="https://beffect.nz/cdn/shop/files/Facebook-ProfileLogo-01_95.jpg?v=1671142822"
            alt="b.effect Brewing logo"
            width={42}
            height={42}
            className="rounded-full border border-white/20 object-cover shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
          />
          <div>
            <p className="brand-display text-lg font-semibold tracking-tight text-white">b.effect</p>
            <p className="text-[11px] uppercase tracking-[0.26em] text-amber-100/80">Keg Tracker</p>
          </div>
          {isDemoUser && (
            <span className="badge-chip hidden items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-50 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
              Demo Mode
            </span>
          )}
        </div>

        {!isAuthRoute && user && (
          <div className="flex items-center gap-3 text-right">
            <div className="hidden rounded-full border border-white/10 bg-[rgba(255,255,255,0.06)] px-3 py-2 sm:block">
              <p className="text-xs font-semibold text-slate-50">{user.displayName}</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="glow-button inline-flex items-center gap-2 rounded-full border border-white/18 bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs font-semibold text-white hover:bg-[rgba(255,255,255,0.14)]"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.9} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
