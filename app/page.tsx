"use client";

import Image from "next/image";

export default function WelcomePage() {
  function onGetStarted() {
    window.location.href = "/login?mode=signup";
  }

  return (
    <main className="page-shell relative -mx-4 -mt-6 min-h-[calc(100vh-5rem)] overflow-hidden md:-mx-5 md:rounded-[32px]">
      <Image
        src="https://beffect.nz/cdn/shop/files/220612-Wanaka-Snow-023.jpg?v=1746667988&width=535"
        alt="Wānaka landscape"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,24,33,0.9),rgba(17,26,34,0.62),rgba(73,94,68,0.46))]" />
      <div className="grain-overlay absolute inset-0" />

      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center px-5 py-12 text-white">
        <div className="float-in editorial-panel editorial-panel--dark grain-overlay max-w-3xl p-7 sm:p-10">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.jpg"
              alt="b.effect Brewing"
              width={88}
              height={88}
              className="rounded-full border border-white/15 bg-[rgba(255,255,255,0.08)] p-1.5 shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
            />
            <div>
              <p className="eyebrow text-amber-100/80">Brewery Ops System</p>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-200/75">b.effect Brewing</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/82">A simple QR-based keg tracking system for b.effect Brewing.</p>
            </div>
          </div>

          <h1 className="display-title mt-7 text-5xl text-balance sm:text-7xl">Track every keg from fill to return without slowing the shift.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100/88 sm:text-lg">
            Give each keg an ID, stick on a QR code, and scan it through every stage of the journey, from filling to delivery to return. Your whole
            team stays on the same page in real time.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.08)] p-4">
              <p className="eyebrow text-[10px] text-amber-100/78">Field Ready</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/86">Works on any phone. Scan a keg in seconds with no laptop, no paperwork, and no fuss.</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.08)] p-4">
              <p className="eyebrow text-[10px] text-amber-100/78">Live Ops</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/86">See where every keg is right now, where it came from, where it is going, and its full history.</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.08)] p-4">
              <p className="eyebrow text-[10px] text-amber-100/78">Sticker Workflow</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/86">Create a keg ID, generate its QR code, and print the label all in one step.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onGetStarted}
              className="glow-button min-h-13 rounded-full bg-[linear-gradient(135deg,#e6b677,#be7c38)] px-6 font-semibold text-white"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/login";
              }}
              className="min-h-13 rounded-full border border-white/20 bg-white/10 px-6 font-semibold text-white hover:bg-white/16"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/how-it-works";
              }}
              className="min-h-13 rounded-full border border-white/10 bg-[rgba(0,0,0,0.1)] px-6 font-semibold text-slate-100 hover:bg-[rgba(0,0,0,0.18)]"
            >
              How It Works
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
