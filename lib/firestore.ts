import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Keg } from "@/types/keg";
import type { KegNameEntry } from "@/types/keg-name";
import type { Location } from "@/types/location";
import type { Movement } from "@/types/movement";
import type { AppUser } from "@/types/user";
import { buildQrCodeValue, DEFAULT_KEG_NAMES, dedupeKegNames, normalizeKegNameInput, slugifyKegName, splitKegNameLines } from "@/lib/keg-names";


interface UserDocument {
  email: string;
  displayName: string;
  role: AppUser["role"];
  requiresPasswordChange: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return undefined;
}

export interface Product {
  id: string;
  name: string;
  abv: number;
}

function normalizeMovement(id: string, raw: Record<string, unknown>): Movement {
  const legacyAction = raw.action as string | undefined;
  const actionMap: Record<string, Movement["scanType"]> = {
    check_in: "return",
    check_out: "deliver",
    fill: "fill",
    empty: "empty",
    ready_for_pickup: "return",
    maintenance: "maintenance",
    lost: "lost",
  };

  return {
    id,
    kegId: (raw.kegId as string | undefined) ?? "",
    scanType: (raw.scanType as Movement["scanType"] | undefined) ?? (legacyAction ? actionMap[legacyAction] : undefined) ?? "fill",
    fromLocation: raw.fromLocation as string | undefined,
    toLocation: raw.toLocation as string | undefined,
    product: raw.product as string | undefined,
    batch: raw.batch as string | undefined,
    timestamp: (raw.timestamp as string | undefined) ?? (raw.createdAt as string | undefined),
    notes: raw.notes as string | undefined,
    updatedBy: (raw.updatedBy as string | undefined) ?? (raw.createdBy as string | undefined) ?? "unknown",
  };
}

function normalizeKeg(id: string, raw: Record<string, unknown>): Keg {
  const legacyStatus = raw.status as string | undefined;
  const statusMap: Record<string, Keg["currentStatus"]> = {
    on_site: "filled",
    off_site: "delivered",
    ready_for_pickup: "returned",
    empty: "empty",
    maintenance: "maintenance",
    lost: "lost",
  };

  return {
    id,
    kegId: (raw.kegId as string | undefined) ?? id,
    qrCode: (raw.qrCode as string | undefined) ?? (raw.qrCodeValue as string | undefined) ?? "",
    currentStatus: (raw.currentStatus as Keg["currentStatus"] | undefined) ?? (legacyStatus ? statusMap[legacyStatus] : undefined) ?? "empty",
    currentLocation: (raw.currentLocation as string | undefined) ?? (raw.locationId as string | undefined) ?? "Brewery",
    intendedLocation: raw.intendedLocation as string | undefined,
    product: (raw.product as string | undefined) ?? (raw.productId as string | undefined),
    batch: raw.batch as string | undefined,
    beerName: raw.beerName as string | undefined,
    abv: raw.abv as number | undefined,
    packagingDate: raw.packagingDate as string | undefined,
    bestBeforeDate: raw.bestBeforeDate as string | undefined,
    lastUpdatedAt: (raw.lastUpdatedAt as string | undefined) ?? (raw.updatedAt as string | undefined),
    createdAt: (raw.createdAt as string | undefined) ?? (raw.lastUpdatedAt as string | undefined) ?? (raw.updatedAt as string | undefined),
  };
}

// b.effect specific product list used in the scan workflows and Firestore seeding.
export const BEFFECT_PRODUCTS: Omit<Product, "id">[] = [
  { name: "Wānaka Lager", abv: 4.0 },
  { name: "Pop’n Pils", abv: 4.5 },
  { name: "Alpine Ale", abv: 4.5 },
  { name: "Hazy IPA", abv: 5.0 },
  { name: "Wānaka Light", abv: 2.5 },
  { name: "Kombucha", abv: 0.0 },
  { name: "Ginger Beer", abv: 4.0 },
];

const DEFAULT_LOCATIONS: Location[] = [
  { id: "brewery", name: "Brewery", type: "brewery", active: true },
  { id: "b-social-tap-room", name: "b.social / Tap Room", type: "venue", active: true },
];

export const collections = {
  users: collection(db, "users"),
  kegs: collection(db, "kegs"),
  kegNames: collection(db, "kegNames"),
  locations: collection(db, "locations"),
  products: collection(db, "products"),
  movements: collection(db, "movements"),
};

export async function seedCoreData() {
  await Promise.all([
    ...BEFFECT_PRODUCTS.map((product) =>
      setDoc(doc(db, "products", product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")), product, { merge: true }),
    ),
    ...DEFAULT_LOCATIONS.map((location) => setDoc(doc(db, "locations", location.id), location, { merge: true })),
  ]);
}

function normalizeKegName(id: string, raw: Record<string, unknown>): KegNameEntry {
  return {
    id,
    name: (raw.name as string | undefined) ?? id,
    assigned: Boolean(raw.assigned),
    assignedKegId: raw.assignedKegId as string | undefined,
    createdAt: (raw.createdAt as string | undefined) ?? (raw.updatedAt as string | undefined),
  };
}

export async function seedDefaultKegNames() {
  const existing = await getDocs(collections.kegNames);
  if (existing.docs.length > 0) {
    return;
  }

  const batch = writeBatch(db);
  const now = new Date().toISOString();

  for (const name of DEFAULT_KEG_NAMES) {
    const normalizedName = normalizeKegNameInput(name);
    const id = slugifyKegName(normalizedName);
    batch.set(doc(db, "kegNames", id), {
      name: normalizedName,
      assigned: false,
      createdAt: now,
    });
  }

  await batch.commit();
}

export async function getKegNames(): Promise<KegNameEntry[]> {
  const snap = await getDocs(collections.kegNames);
  return snap.docs.map((d) => normalizeKegName(d.id, d.data()));
}

export async function getAvailableKegNames(): Promise<KegNameEntry[]> {
  const names = await getKegNames();
  return names
    .filter((entry) => !entry.assigned)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getKegNameSummary() {
  const names = await getKegNames();
  const assigned = names.filter((entry) => entry.assigned).length;

  return {
    total: names.length,
    assigned,
    available: names.length - assigned,
  };
}

export async function addKegNames(rawValue: string) {
  const parsedNames = dedupeKegNames(splitKegNameLines(rawValue));
  if (parsedNames.length === 0) {
    return { added: 0, skipped: 0 };
  }

  const existing = await getKegNames();
  const existingIds = new Set(existing.map((entry) => entry.id));
  const toAdd = parsedNames.filter((name) => !existingIds.has(slugifyKegName(name)));
  const skipped = parsedNames.length - toAdd.length;

  if (toAdd.length === 0) {
    return { added: 0, skipped };
  }

  const batch = writeBatch(db);
  const now = new Date().toISOString();

  for (const name of toAdd) {
    const normalizedName = normalizeKegNameInput(name);
    batch.set(doc(db, "kegNames", slugifyKegName(normalizedName)), {
      name: normalizedName,
      assigned: false,
      createdAt: now,
    });
  }

  await batch.commit();
  return { added: toAdd.length, skipped };
}

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collections.products);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }));
}

export async function getUserById(uid: string): Promise<AppUser | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;

  const raw = snap.data() as UserDocument;
  return {
    uid: snap.id,
    email: raw.email,
    displayName: raw.displayName,
    role: raw.role,
    requiresPasswordChange: Boolean(raw.requiresPasswordChange),
    createdAt: toIsoString(raw.createdAt),
    lastLoginAt: toIsoString(raw.lastLoginAt),
  };
}

export async function updateUserLastLogin(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    lastLoginAt: new Date().toISOString(),
  });
}

export async function clearPasswordChangeRequirement(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    requiresPasswordChange: false,
  });
}

export async function getKegs(): Promise<Keg[]> {
  const snap = await getDocs(collections.kegs);
  return snap.docs.map((d) => normalizeKeg(d.id, d.data()));
}

export async function getKegByQr(qrCode: string): Promise<Keg | null> {
  const q = query(collections.kegs, where("qrCode", "==", qrCode), limit(1));
  const snap = await getDocs(q);
  const legacyQuery = query(collections.kegs, where("qrCodeValue", "==", qrCode), limit(1));
  const legacySnap = snap.docs.length === 0 ? await getDocs(legacyQuery) : null;
  const first = snap.docs[0] ?? legacySnap?.docs[0];
  if (!first) return null;
  return normalizeKeg(first.id, first.data());
}

export async function getKegById(id: string): Promise<Keg | null> {
  const kegRef = doc(db, "kegs", id);
  const snap = await getDoc(kegRef);
  if (!snap.exists()) return null;
  return normalizeKeg(snap.id, snap.data());
}

export async function updateKeg(id: string, payload: Partial<Keg>) {
  return updateDoc(doc(db, "kegs", id), payload);
}

export interface CreateKegInput {
  kegId: string;
  currentLocation?: string;
  intendedLocation?: string;
  product?: string;
  beerName?: string;
  batch?: string;
  abv?: number;
  packagingDate?: string;
  bestBeforeDate?: string;
}

export async function createKeg(payload: CreateKegInput) {
  const kegId = payload.kegId.trim();
  const id = slugifyKegName(kegId);
  const kegRef = doc(db, "kegs", id);
  const kegNameRef = doc(db, "kegNames", slugifyKegName(kegId));

  const now = new Date().toISOString();
  const currentLocation = payload.currentLocation?.trim() || "Brewery";
  const intendedLocation = payload.intendedLocation?.trim() || undefined;

  const keg: Omit<Keg, "id"> = {
    kegId,
    qrCode: buildQrCodeValue(kegId),
    currentStatus: payload.product || payload.beerName ? "filled" : "empty",
    currentLocation,
    intendedLocation,
    product: payload.product?.trim() || undefined,
    beerName: payload.beerName?.trim() || undefined,
    batch: payload.batch?.trim() || undefined,
    abv: payload.abv,
    packagingDate: payload.packagingDate?.trim() || undefined,
    bestBeforeDate: payload.bestBeforeDate?.trim() || undefined,
    createdAt: now,
    lastUpdatedAt: now,
  };

  await runTransaction(db, async (transaction) => {
    const [existingKeg, nameSnap] = await Promise.all([transaction.get(kegRef), transaction.get(kegNameRef)]);

    if (existingKeg.exists()) {
      throw new Error("A keg with that name already exists.");
    }

    if (!nameSnap.exists()) {
      throw new Error("This keg name is not available. Add it in settings first.");
    }

    const nameData = nameSnap.data() as Record<string, unknown>;
    if (Boolean(nameData.assigned)) {
      throw new Error("That keg name has already been assigned.");
    }

    transaction.set(kegRef, keg);
    transaction.update(kegNameRef, {
      assigned: true,
      assignedKegId: id,
    });
  });

  return { id, ...keg };
}

export async function createMovement(payload: Omit<Movement, "id">) {
  return addDoc(collections.movements, {
    ...payload,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

export async function getMovementsByKeg(kegId: string): Promise<Movement[]> {
  const q = query(collections.movements, where("kegId", "==", kegId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeMovement(d.id, d.data()));
}

export async function getRecentMovements(max = 20): Promise<Movement[]> {
  const q = query(collections.movements, orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeMovement(d.id, d.data()));
}

export async function getLocations(): Promise<Location[]> {
  const snap = await getDocs(collections.locations);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Location, "id">) }));
}

export async function upsertLocation(location: Location) {
  return setDoc(doc(db, "locations", location.id), location, { merge: true });
}
