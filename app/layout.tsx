import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Providers } from "@/app/providers";
import "./globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body-ui",
  weight: ["400", "500", "600", "700", "800"],
});

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
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-slate-900">
        <Providers>
          <div className="app-shell">
            <div className="app-shell__glow app-shell__glow--left" />
            <div className="app-shell__glow app-shell__glow--right" />
            <AppHeader />
            <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-5 md:pb-8 md:pt-8">{children}</div>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
