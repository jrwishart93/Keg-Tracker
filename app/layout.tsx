import type { Metadata } from "next";
import Image from "next/image";
import { BottomNav } from "@/components/BottomNav";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keg Tracker",
  description: "Track keg locations and movements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans text-slate-900">
        <Providers>
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
            </div>
          </header>
          <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-5 md:pb-5">{children}</div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
