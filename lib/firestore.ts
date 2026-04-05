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
import type { CustomerRequest, CustomerRequestType } from "@/types/customer-request";
import type { Keg } from "@/types/keg";
import type { KegNameEntry } from "@/types/keg-name";
import type { Location } from "@/types/location";
import type { Movement } from "@/types/movement";
import type { AppUser } from "@/types/user";
import {
  buildQrCodeValue,
  DEFAULT_KEG_NAMES,
  dedupeKegNames,
  getKegIdFromQrValue,
  isValidQrCodeValue,
  normalizeKegNameInput,
  slugifyKegName,
  splitKegNameLines,
} from "@/lib/keg-names";


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
  const rawScanType = raw.scanType as string | undefined;
  const rawType = (raw.type as string | undefined) ?? (raw.action as string | undefined);
  const actionMap: Record<string, Movement["scanType"]> = {
    check_in: "return",
    check_out: "deliver",
    wash: "wash",
    fill: "fill",
    deliver: "deliver",
    delivery: "deliver",
    empty: "empty",
    ready_for_pickup: "return",
    maintenance: "maintenance",
    lost: "lost",
    customer_request: "customer_request",
  };

  const resolvedType = (rawScanType ? actionMap[rawScanType] ?? (rawScanType as Movement["scanType"]) : undefined)
    ?? (rawType ? actionMap[rawType] : undefined)
    ?? "fill";
  const resolvedEventType = (raw.type as Movement["type"] | undefined)
    ?? (rawScanType === "deliver" ? "delivery" : (resolvedType as Movement["type"]));

  return {
    id,
    kegId: (raw.kegId as string | undefined) ?? "",
    scanType: resolvedType,
    type: resolvedEventType,
    fromLocation: raw.fromLocation as string | undefined,
    toLocation: raw.toLocation as string | undefined,
    product: raw.product as string | undefined,
    batch: raw.batch as string | undefined,
    timestamp: (raw.timestamp as string | undefined) ?? (raw.createdAt as string | undefined),
    userId: raw.userId as string | undefined,
    notes: raw.notes as string | undefined,
    updatedBy: (raw.updatedBy as string | undefined) ?? (raw.createdBy as string | undefined) ?? "unknown",
  };
}

function normalizeKeg(id: string, raw: Record<string, unknown>): Keg {
  const legacyStatus = raw.status as string | undefined;
  const statusMap: Record<string, Keg["currentStatus"]> = {
    on_site: "filled",
    off_site: "delivered",
    washed: "washed",
    ready_for_pickup: "returned",
    empty: "empty",
    maintenance: "maintenance",
    lost: "lost",
  };

  const resolvedStatus =
    (raw.currentStatus as Keg["currentStatus"] | undefined) ??
    (legacyStatus ? statusMap[legacyStatus] : undefined) ??
    "empty";
  const productName = (raw.productName as string | undefined) ?? (raw.beerName as string | undefined) ?? (raw.product as string | undefined);
  const batchNumber = (raw.batchNumber as string | undefined) ?? (raw.batch as string | undefined);
  const filledAt = toIsoString(raw.filledAt) ?? (raw.packagingDate as string | undefined) ?? null;
  const bestBefore = toIsoString(raw.bestBefore) ?? (raw.bestBeforeDate as string | undefined) ?? null;
  const lastUpdatedAt = (raw.lastUpdatedAt as string | undefined) ?? (raw.lastUpdated as string | undefined) ?? (raw.updatedAt as string | undefined);

  return {
    id,
    kegId: (raw.kegId as string | undefined) ?? id,
    name: (raw.name as string | undefined) ?? (raw.kegId as string | undefined) ?? id,
    qrCode: (raw.qrCode as string | undefined) ?? (raw.qrCodeValue as string | undefined) ?? "",
    currentStatus: resolvedStatus,
    status: resolvedStatus,
    washedAt: toIsoString(raw.washedAt) ?? null,
    filledAt,
    bestBefore,
    productName,
    batchNumber,
    currentLocation: (raw.currentLocation as string | undefined) ?? (raw.locationId as string | undefined) ?? "Brewery",
    intendedLocation: raw.intendedLocation as string | undefined,
    assignedCustomerId: (raw.assignedCustomerId as string | undefined) ?? null,
    product: (raw.product as string | undefined) ?? (raw.productId as string | undefined) ?? productName ?? undefined,
    batch: raw.batch as string | undefined,
    beerName: raw.beerName as string | undefined,
    abv: raw.abv as number | undefined,
    packagingDate: (raw.packagingDate as string | undefined) ?? filledAt ?? undefined,
    bestBeforeDate: bestBefore ?? undefined,
    lastUpdatedAt,
    lastUpdated: lastUpdatedAt,
    createdAt: (raw.createdAt as string | undefined) ?? lastUpdatedAt ?? (raw.updatedAt as string | undefined),
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
  customerRequests: collection(db, "customerRequests"),
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

function normalizeCustomerRequest(id: string, raw: Record<string, unknown>): CustomerRequest {
  return {
    id,
    kegId: (raw.kegId as string | undefined) ?? "",
    requestType: (raw.requestType as CustomerRequestType | undefined) ?? "reorder",
    customerName: raw.customerName as string | undefined,
    customerContact: raw.customerContact as string | undefined,
    createdAt: toIsoString(raw.createdAt),
    status: (raw.status as CustomerRequest["status"] | undefined) ?? "pending",
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

export async function upsertUserProfile(
  uid: string,
  payload: {
    email: string;
    displayName: string;
    role?: AppUser["role"];
    requiresPasswordChange?: boolean;
    createdAt?: string;
    lastLoginAt?: string;
  },
) {
  const now = new Date().toISOString();

  await setDoc(
    doc(db, "users", uid),
    {
      email: payload.email,
      displayName: payload.displayName,
      role: payload.role ?? "staff",
      requiresPasswordChange: payload.requiresPasswordChange ?? false,
      createdAt: payload.createdAt ?? now,
      lastLoginAt: payload.lastLoginAt ?? now,
    },
    { merge: true },
  );
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
  if (first) {
    return normalizeKeg(first.id, first.data());
  }

  const derivedId = getKegIdFromQrValue(qrCode);
  if (!derivedId) return null;

  return getKegById(derivedId);
}

export async function getKegById(id: string): Promise<Keg | null> {
  const kegRef = doc(db, "kegs", id);
  const snap = await getDoc(kegRef);
  if (!snap.exists()) return null;
  return normalizeKeg(snap.id, snap.data());
}

export async function updateKeg(id: string, payload: Record<string, unknown>) {
  return updateDoc(doc(db, "kegs", id), payload);
}

export interface CreateKegInput {
  kegId: string;
  currentLocation?: string;
  intendedLocation?: string;
  assignedCustomerId?: string;
  product?: string;
  productName?: string;
  beerName?: string;
  batch?: string;
  batchNumber?: string;
  abv?: number;
  packagingDate?: string;
  filledAt?: string;
  bestBeforeDate?: string;
  bestBefore?: string;
}

export async function createKeg(payload: CreateKegInput) {
  const kegId = normalizeKegNameInput(payload.kegId);
  if (!kegId) {
    throw new Error("Choose a keg name before creating the keg.");
  }

  const id = slugifyKegName(kegId);
  const kegRef = doc(db, "kegs", id);
  const kegNameRef = doc(db, "kegNames", slugifyKegName(kegId));
  const qrCode = buildQrCodeValue(kegId);

  if (!isValidQrCodeValue(qrCode)) {
    throw new Error("Could not generate a valid QR code for this keg.");
  }

  const now = new Date().toISOString();
  const currentLocation = payload.currentLocation?.trim() || "Brewery";
  const intendedLocation = payload.intendedLocation?.trim() || undefined;
  const resolvedProductName = payload.productName?.trim() || payload.beerName?.trim() || payload.product?.trim() || undefined;
  const resolvedBatchNumber = payload.batchNumber?.trim() || payload.batch?.trim() || undefined;
  const resolvedFilledAt = resolvedProductName ? payload.filledAt?.trim() || payload.packagingDate?.trim() || now : null;
  const resolvedBestBefore = payload.bestBefore?.trim() || payload.bestBeforeDate?.trim() || null;
  const resolvedStatus: Keg["currentStatus"] = resolvedProductName ? "filled" : "empty";

  const keg: Omit<Keg, "id"> = {
    kegId,
    name: kegId,
    qrCode,
    currentStatus: resolvedStatus,
    status: resolvedStatus,
    washedAt: null,
    filledAt: resolvedFilledAt,
    bestBefore: resolvedBestBefore,
    productName: resolvedProductName ?? null,
    batchNumber: resolvedBatchNumber ?? null,
    currentLocation,
    intendedLocation,
    assignedCustomerId: payload.assignedCustomerId?.trim() || null,
    product: payload.product?.trim() || resolvedProductName || undefined,
    beerName: payload.beerName?.trim() || resolvedProductName || undefined,
    batch: payload.batch?.trim() || resolvedBatchNumber || undefined,
    abv: payload.abv,
    packagingDate: payload.packagingDate?.trim() || resolvedFilledAt || undefined,
    bestBeforeDate: payload.bestBeforeDate?.trim() || resolvedBestBefore || undefined,
    createdAt: now,
    lastUpdatedAt: now,
    lastUpdated: now,
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
    type: payload.type ?? payload.scanType,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

export async function getMovementsByKeg(kegId: string): Promise<Movement[]> {
  const keg = await getKegById(kegId);
  const queries = [query(collections.movements, where("kegId", "==", kegId), orderBy("createdAt", "desc"))];

  if (keg?.kegId && keg.kegId !== kegId) {
    queries.push(query(collections.movements, where("kegId", "==", keg.kegId), orderBy("createdAt", "desc")));
  }

  const snapshots = await Promise.all(queries.map((movementQuery) => getDocs(movementQuery)));
  const uniqueDocs = new Map<string, Movement>();

  for (const snap of snapshots) {
    for (const movementDoc of snap.docs) {
      uniqueDocs.set(movementDoc.id, normalizeMovement(movementDoc.id, movementDoc.data()));
    }
  }

  return [...uniqueDocs.values()].sort((left, right) => (right.timestamp ?? "").localeCompare(left.timestamp ?? ""));
}

export async function getRecentMovements(max = 20): Promise<Movement[]> {
  const q = query(collections.movements, orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeMovement(d.id, d.data()));
}

type MovementWriteInput = Omit<Movement, "id">;

async function updateKegWithMovement(kegDocId: string, kegPatch: Record<string, unknown>, movement: MovementWriteInput) {
  const batch = writeBatch(db);
  const movementRef = doc(collections.movements);

  batch.update(doc(db, "kegs", kegDocId), kegPatch);
  batch.set(movementRef, {
    ...movement,
    type: movement.type ?? movement.scanType,
    timestamp: movement.timestamp ?? new Date().toISOString(),
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function markKegWashed(params: { kegDocId: string; userId: string; updatedBy: string; notes?: string }) {
  const keg = await getKegById(params.kegDocId);
  if (!keg) {
    throw new Error("Keg not found.");
  }

  const now = new Date().toISOString();

  await updateKegWithMovement(
    params.kegDocId,
    {
      currentStatus: "washed",
      status: "washed",
      washedAt: now,
      filledAt: null,
      bestBefore: null,
      productName: null,
      batchNumber: null,
      assignedCustomerId: null,
      product: null,
      beerName: null,
      batch: null,
      packagingDate: null,
      bestBeforeDate: null,
      lastUpdatedAt: now,
      lastUpdated: now,
    },
    {
      kegId: keg.kegId ?? keg.id,
      scanType: "wash",
      type: "wash",
      fromLocation: keg.currentLocation,
      toLocation: keg.currentLocation,
      timestamp: now,
      userId: params.userId,
      notes: params.notes,
      updatedBy: params.updatedBy,
    },
  );
}

export async function fillKegLifecycle(params: {
  kegDocId: string;
  productName: string;
  batchNumber?: string;
  bestBefore: string;
  userId: string;
  updatedBy: string;
  notes?: string;
}) {
  const keg = await getKegById(params.kegDocId);
  if (!keg) {
    throw new Error("Keg not found.");
  }

  const productName = params.productName.trim();
  const bestBefore = params.bestBefore.trim();
  if (!productName || !bestBefore) {
    throw new Error("Product name and best before date are required.");
  }

  const now = new Date().toISOString();
  const batchNumber = params.batchNumber?.trim() || undefined;

  await updateKegWithMovement(
    params.kegDocId,
    {
      currentStatus: "filled",
      status: "filled",
      filledAt: now,
      bestBefore,
      productName,
      batchNumber: batchNumber ?? null,
      product: productName,
      beerName: productName,
      batch: batchNumber,
      packagingDate: now,
      bestBeforeDate: bestBefore,
      lastUpdatedAt: now,
      lastUpdated: now,
    },
    {
      kegId: keg.kegId ?? keg.id,
      scanType: "fill",
      type: "fill",
      fromLocation: keg.currentLocation,
      toLocation: keg.currentLocation,
      product: productName,
      batch: batchNumber,
      timestamp: now,
      userId: params.userId,
      notes: params.notes,
      updatedBy: params.updatedBy,
    },
  );
}

export async function deliverKegLifecycle(params: {
  kegDocId: string;
  customerName: string;
  location: string;
  userId: string;
  updatedBy: string;
  notes?: string;
}) {
  const keg = await getKegById(params.kegDocId);
  if (!keg) {
    throw new Error("Keg not found.");
  }

  const customerName = params.customerName.trim();
  const location = params.location.trim();
  if (!customerName || !location) {
    throw new Error("Customer and location are required.");
  }

  const now = new Date().toISOString();

  await updateKegWithMovement(
    params.kegDocId,
    {
      currentStatus: "delivered",
      status: "delivered",
      currentLocation: location,
      intendedLocation: location,
      assignedCustomerId: customerName,
      lastUpdatedAt: now,
      lastUpdated: now,
    },
    {
      kegId: keg.kegId ?? keg.id,
      scanType: "deliver",
      type: "delivery",
      fromLocation: keg.currentLocation,
      toLocation: location,
      product: keg.productName ?? keg.product,
      batch: keg.batchNumber ?? keg.batch,
      timestamp: now,
      userId: params.userId,
      notes: params.notes ?? `Delivered to ${customerName}`,
      updatedBy: params.updatedBy,
    },
  );
}

export async function getCustomerRequests(): Promise<CustomerRequest[]> {
  const requestQuery = query(collections.customerRequests, orderBy("createdAt", "desc"));
  const snap = await getDocs(requestQuery);
  return snap.docs.map((requestDoc) => normalizeCustomerRequest(requestDoc.id, requestDoc.data()));
}

export async function createCustomerRequest(payload: {
  kegId: string;
  requestType: CustomerRequestType;
  customerName?: string;
  customerContact?: string;
}) {
  const createdAt = new Date().toISOString();
  const requestRef = doc(collections.customerRequests);
  const movementRef = doc(collections.movements);
  const batch = writeBatch(db);

  batch.set(requestRef, {
    kegId: payload.kegId,
    requestType: payload.requestType,
    customerName: payload.customerName?.trim() || null,
    customerContact: payload.customerContact?.trim() || null,
    createdAt,
    status: "pending",
  });

  batch.set(movementRef, {
    kegId: payload.kegId,
    scanType: "customer_request",
    type: "customer_request",
    timestamp: createdAt,
    userId: "customer",
    updatedBy: "Customer",
    notes: payload.requestType,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return requestRef;
}

export async function getLocations(): Promise<Location[]> {
  const snap = await getDocs(collections.locations);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Location, "id">) }));
}

export async function upsertLocation(location: Location) {
  return setDoc(doc(db, "locations", location.id), location, { merge: true });
}
