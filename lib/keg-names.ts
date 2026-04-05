import type { KegNameEntry } from "@/types/keg-name";

export const DEFAULT_KEG_NAMES = [
  "Wanaka Wobbler",
  "Roys Pour",
  "Lake Lager",
  "Cardrona Cask",
  "Hawea Hopper",
  "Alpine Ale",
  "Kiwi Keg",
  "Pounamu Pour",
  "Otago Tap",
  "Wanaka Wanderer",
  "Kegasus Prime",
  "Brew Beast",
  "Hops Master",
  "Ale Mary",
  "Hopzilla Unit",
  "Brew Crew",
  "Kegatron Unit",
  "Pour Decision",
  "Lager Legend",
  "Brew Boss",
  "Drunken Drum",
  "Keggy Smalls",
  "Tap That",
  "Pour More",
  "Liquid Courage",
  "Weekend Warrior",
  "Hangover Helper",
  "Buzzed Barrel",
  "Suds Master",
  "Thirst Trap",
  "Milford Sipper",
  "Queenstown Quencher",
  "Fiordland Froth",
  "Bluff Barrel",
  "Rotorua Rumbler",
  "Taranaki Tap",
  "Coromandel Cooler",
  "Dunedin Draught",
  "Nelson Nectar",
  "Canterbury Cask",
  "Golden Draught",
  "Black Hops",
  "Pale Prince",
  "IPA Icon",
  "Dark Draft",
  "Session King",
  "Barrel Boss",
  "Craft Commander",
  "Ferment Unit",
  "Tap Titan",
  "Brew Wayne",
  "Kegobi Master",
  "Froth Vader",
  "Keg Sheeran",
  "Brewsteen Boss",
  "Ale Pacino",
  "Keg Stardust",
  "Notorious Keg",
  "Hoptimus Prime",
  "Lagerfeld Karl",
  "Snowline Sipper",
  "Alpine Unit",
  "Glacier Guzzler",
  "Trail Tap",
  "Summit Suds",
  "Mountain Malt",
  "Ridge Runner",
  "Peak Pour",
  "Lakefront Lager",
  "Adventure Ale",
  "Quiet One",
  "Empty Always",
  "Never Returned",
  "Favourite Keg",
  "Last Standing",
  "Early Starter",
  "Late Finisher",
  "Social Pour",
  "Problem Child",
  "Reliable Unit",
  "Bad Influence",
  "Full Send",
  "Send Unit",
  "No Regrets",
  "Risky Pour",
  "Party Starter",
  "Liquid Asset",
  "Tax Writeoff",
  "Bottoms Up",
  "Final Pour",
  "Keg Alpha",
  "Keg Bravo",
  "Keg Charlie",
  "Keg Delta",
  "Keg Echo",
  "Keg Foxtrot",
  "Keg Nova",
  "Keg Atlas",
  "Keg Prime",
  "Keg One",
  "Wanaka Drifter",
  "Alpine Pour",
  "Lake Drinker",
  "Southern Pour",
  "Otago Spirit",
  "Glacier Pour",
  "River Hopper",
  "Valley Brew",
  "Summit Pour",
  "Ridge Hopper",
  "Hop Hustler",
  "Malt Master",
  "Brew Driver",
  "Keg Hustle",
  "Foam Fighter",
  "Draft Dealer",
  "Ale Runner",
  "Brew Flow",
  "Tap Wizard",
  "Pour Pilot",
  "Sneaky Pint",
  "Cheeky Pour",
  "Big Sipper",
  "Fast Drinker",
  "Thirst Machine",
  "Pint Bandit",
  "Pour Bandit",
  "Keg Bandit",
  "Silent Sipper",
  "Heavy Hitter",
  "Wanaka Pour",
  "Queenstown Pour",
  "Otago Brew",
  "Southland Sipper",
  "Nelson Pour",
  "Canterbury Brew",
  "Fiordland Pour",
  "Bluff Sipper",
  "Rotorua Brew",
  "Taranaki Pour",
  "Golden Pour",
  "Silver Keg",
  "Bronze Barrel",
  "Amber Pour",
  "Crisp Lager",
  "Smooth Ale",
  "Dark Pour",
  "Fresh Draft",
  "Cold Pour",
  "Clean Keg",
  "Brew Norris",
  "Keg Solo",
  "Hop Marley",
  "Ale Baldwin",
  "Brew Jackson",
  "Keg Diesel",
  "Hop Cruise",
  "Brew Pitt",
  "Keg Clooney",
  "Ale Presley",
  "Trail Runner",
  "Summit Runner",
  "Ridge Pour",
  "Valley Runner",
  "Alpine Runner",
  "Glacier Runner",
  "Peak Runner",
  "Wild Pour",
  "Open Trail",
  "Fresh Air",
  "Quiet Pour",
  "Loud Pour",
  "Fast Pour",
  "Slow Pour",
  "Smart Keg",
  "Clever Pour",
  "Lazy Pour",
  "Busy Pour",
  "Bold Keg",
  "Chill Keg",
  "Full Pour",
  "Hard Pour",
  "Night Pour",
  "Day Drinker",
  "Quick Pour",
  "Strong Pour",
  "Smooth Operator",
  "Party Pour",
  "Late Night",
  "Early Pour",
  "Keg Vector",
  "Keg Orbit",
  "Keg Pulse",
  "Keg Signal",
  "Keg Motion",
  "Keg Drift",
  "Keg Flow",
  "Keg Core",
  "Keg Link",
  "Keg Sync",
] as const;

const PUBLIC_APP_URL_FALLBACK = "https://keg-tracker.vercel.app";

export function slugifyKegName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[-\s]+/g, "-");
}

function getPublicAppUrl() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return (process.env.NEXT_PUBLIC_APP_URL ?? PUBLIC_APP_URL_FALLBACK).replace(/\/+$/, "");
}

export function buildCustomerKegPath(name: string) {
  return `/keg/${slugifyKegName(name)}`;
}

export function buildCustomerKegUrl(name: string) {
  return `${getPublicAppUrl()}${buildCustomerKegPath(name)}`;
}

export function buildQrCodeValue(name: string) {
  return buildCustomerKegUrl(name);
}

export function getKegIdFromQrValue(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.startsWith("keg-tracker:")) {
    return normalizedValue.slice("keg-tracker:".length) || null;
  }

  if (normalizedValue.startsWith("/keg/")) {
    return normalizedValue.split("/keg/")[1]?.split(/[/?#]/)[0] ?? null;
  }

  try {
    const url = new URL(normalizedValue);
    const match = url.pathname.match(/^\/keg\/([^/?#]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function isValidQrCodeValue(value: string) {
  return Boolean(getKegIdFromQrValue(value));
}

export function normalizeKegNameInput(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function splitKegNameLines(value: string) {
  return value
    .split(/\r?\n/)
    .map(normalizeKegNameInput)
    .filter(Boolean);
}

export function dedupeKegNames(names: string[]) {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const name of names) {
    const id = slugifyKegName(name);
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(name);
  }

  return deduped;
}

export function sortKegNames(entries: KegNameEntry[]) {
  return [...entries].sort((left, right) => left.name.localeCompare(right.name));
}
