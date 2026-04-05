import Link from "next/link";

const commonIssues = [
  "Kegs going missing or unaccounted for",
  "No clear record of movements",
  "Reliance on paper notes or spreadsheets",
  "Limited visibility for managers or head office",
];

const workflowSteps = [
  {
    title: "Each keg has a unique identity",
    body: "Every keg is assigned a unique ID, a name, and a QR code sticker so it can be tracked individually.",
  },
  {
    title: "Staff scan using mobile",
    body: "Using a phone, staff scan the QR code and record what is happening, such as a keg being filled, delivered, moved, returned, or emptied.",
  },
  {
    title: "Movements are logged instantly",
    body: "Each scan creates a time-stamped record of what happened, where it happened, and who recorded it, building a full history for every keg.",
  },
  {
    title: "Data is stored centrally",
    body: "All keg activity is stored in one system to create a single source of truth for keg locations, movement history, and current status.",
  },
  {
    title: "Admin and head office view everything on desktop",
    body: "Managers can see where kegs are, track deliveries and returns, review histories, and identify missing or overdue units from a central dashboard.",
  },
];

const mobileBenefits = [
  "Optimised for phones",
  "Quick QR scanning with minimal typing",
  "Simple interface for busy shifts",
  "Usable in the brewery, warehouse, or on delivery",
];

const desktopBenefits = [
  "Monitor stock across locations",
  "Track keg movement patterns",
  "Check activity history",
  "Manage operations more effectively",
];

const kegJourney = [
  "Keg is filled at the brewery",
  "QR code is scanned and marked as filled",
  "Keg is scanned out for delivery",
  "Keg arrives at a venue and its location is recorded",
  "Empty keg is collected and scanned",
  "Keg is returned to the brewery and logged back in",
];

const qrBenefits = [
  "Quick to scan using standard phones",
  "Easy to apply to kegs",
  "Faster than manual entry",
  "Less prone to errors",
];

const futureFeatures = [
  "Expanded role controls for staff, admin, and managers",
  "Full mobile scanning workflow",
  "Desktop dashboard with reporting",
  "Automated alerts and notifications",
  "Complete tracking across all locations",
];

const currentBuildBenefits = [
  "Create an account and explore the workflow",
  "Navigate the current operational screens",
  "Understand how movements are recorded",
];

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="editorial-panel p-5 sm:p-6">
      <div className="mb-4">
        <p className="section-kicker">How It Works</p>
        <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="page-shell space-y-6">
      <section className="editorial-panel editorial-panel--dark grain-overlay overflow-hidden p-6 text-white shadow-sm">
        <div className="max-w-3xl">
          <p className="eyebrow text-slate-200">How Keg Tracker Works</p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight sm:text-6xl">Simple keg tracking, built for real use.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base">
            Keg Tracker makes it easy to record, track, and manage keg movements across your brewery, warehouse, and delivery routes.
            Staff scan and log activity in seconds, while admin and head office get a clear operational view from one central system.
          </p>
          <p className="mt-3 text-sm font-medium text-slate-200">Fast to use on the ground. Clear to manage from the office.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="glow-button inline-flex min-h-12 items-center rounded-full bg-white px-5 font-semibold text-[#131E29]">
              Back To Welcome
            </Link>
            <Link href="/login" className="inline-flex min-h-12 items-center rounded-full border border-white/30 px-5 font-semibold text-white">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <SectionCard title="Why This App Exists">
        <p className="text-sm leading-6 text-slate-700">
          Kegs are constantly moving between locations. Without a simple system, it becomes difficult to keep track of where they are, who moved them,
          and when. Keg Tracker solves this by creating one clear, central record of every keg movement.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {commonIssues.map((issue) => (
            <li key={issue} className="rounded-[18px] bg-[rgba(255,255,255,0.58)] px-4 py-3 text-sm text-slate-700">
              {issue}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="How It Works" description="The system is built around quick QR scanning and simple updates.">
        <div className="grid gap-4 lg:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <article key={step.title} className="rounded-[22px] bg-[rgba(255,255,255,0.58)] p-4">
              <p className="section-kicker">Step {index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{step.body}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Built For Mobile Use">
          <p className="text-sm leading-6 text-slate-700">
            The app is designed for real working environments. Staff can scan, update, and move on without slowing down the shift.
          </p>
          <ul className="mt-4 space-y-2">
            {mobileBenefits.map((item) => (
              <li key={item} className="rounded-[18px] bg-[rgba(255,255,255,0.58)] px-4 py-3 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Desktop Dashboard For Oversight">
          <p className="text-sm leading-6 text-slate-700">
            While staff use mobile to record activity, admin and head office get full visibility into stock, movements, and operational performance.
          </p>
          <ul className="mt-4 space-y-2">
            {desktopBenefits.map((item) => (
              <li key={item} className="rounded-[18px] bg-[rgba(255,255,255,0.58)] px-4 py-3 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="A Typical Keg Journey">
          <ol className="space-y-3">
            {kegJourney.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-[20px] bg-[rgba(255,255,255,0.58)] p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#131E29] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            At any point in that journey, the full history of the keg can be viewed from the system.
          </p>
        </SectionCard>

        <SectionCard title="Why QR Codes">
          <p className="text-sm leading-6 text-slate-700">
            QR codes make keg tracking practical because they are easy to use in the field and remove the need for specialist hardware.
          </p>
          <ul className="mt-4 space-y-2">
            {qrBenefits.map((item) => (
              <li key={item} className="rounded-[18px] bg-[rgba(255,255,255,0.58)] px-4 py-3 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-medium text-slate-700">No specialist hardware is required.</p>
        </SectionCard>
      </div>

      <SectionCard title="What This App Will Become">
        <p className="text-sm leading-6 text-slate-700">
          The current version is a working prototype designed to demonstrate how the system will operate. The full version is intended to become a
          single, reliable system that tracks every keg movement from start to finish.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {futureFeatures.map((item) => (
            <li key={item} className="rounded-[18px] bg-[rgba(255,255,255,0.58)] px-4 py-3 text-sm text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      </SectionCard>

      <section className="editorial-panel editorial-panel--dark p-6 text-white shadow-sm">
        <p className="eyebrow text-slate-300">Try The Current Build</p>
        <h2 className="mt-3 text-4xl font-semibold">Explore the workflow before full deployment.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100">
          You can create an account and explore the current prototype. It is a preview of how the live product will function once fully deployed.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {currentBuildBenefits.map((item) => (
            <li key={item} className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-slate-100">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="glow-button inline-flex min-h-12 items-center rounded-full bg-white px-5 font-semibold text-[#131E29]">
            Go To Welcome Screen
          </Link>
          <Link href="/login?mode=signup" className="inline-flex min-h-12 items-center rounded-full border border-white/30 px-5 font-semibold text-white">
            Create Account
          </Link>
        </div>
      </section>
    </main>
  );
}
