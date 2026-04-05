import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
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
          <AppHeader />
          <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-5 md:pb-5">{children}</div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
