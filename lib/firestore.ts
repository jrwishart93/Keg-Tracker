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
import type { KegStatus } from "@/types/keg";
import type { KegEvent, RecordKegScanInput } from "@/types/keg-event";
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
import { KEG_SCAN_LABELS, isKegScanType } from "@/types/keg-event";


interface UserDocument {
  email: string;
  displayName: string;
  role: AppUser["role"];
  requiresPasswordChange: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

function trimString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return undefined;
}

function humanizeToken(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function normalizeStatusLabel(value?: string | null): KegStatus {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case "available":
      return "Available";
    case "checked in":
    case "checked_in":
      return "Checked In";
    case "checked out":
    case "checked_out":
      return "Checked Out";
    case "delivered":
    case "off_site":
      return "Delivered";
    case "empty":
      return "Empty";
    case "filled":
    case "on_site":
      return "Filled";
    case "in maintenance":
    case "into maintenance":
    case "maintenance":
      return "In Maintenance";
    case "lost":
      return "Lost";
    case "palletized":
      return "Palletized";
    case "ready for pickup":
    case "ready_for_pickup":
      return "Ready for Pickup";
    case "returned":
    case "return":
      return "Returned";
    case "washed":
      return "Washed";
    default:
      return "Empty";
  }
}

function normalizeEventTimestamp(raw: Record<string, unknown>) {
  return toIsoString(raw.timestamp) ?? toIsoString(raw.createdAt) ?? new Date(0).toISOString();
}

function normalizeKegEvent(id: string, raw: Record<string, unknown>): KegEvent {
  const rawType = trimString(raw.type) ?? "CHECK_IN";
  const type = isKegScanType(rawType) ? rawType : "CHECK_IN";
  const metadata = raw.metadata && typeof raw.metadata === "object" ? (raw.metadata as Record<string, unknown>) : {};

  return {
    id,
    type,
    label: trimString(raw.label) ?? KEG_SCAN_LABELS[type],
    timestamp: normalizeEventTimestamp(raw),
    userId: trimString(raw.userId),
    userName: trimString(raw.userName),
    notes: trimString(raw.notes),
    metadata,
  };
}

export interface Product {
  id: string;
  name: string;
  abv: number;
}

function normalizeMovement(id: string, raw: Record<string, unknown>): Movement {
  const rawScanType = trimString(raw.scanType);
  const rawType = trimString(raw.type) ?? trimString(raw.action);
  const resolvedScanType = rawScanType ?? rawType ?? "UNKNOWN";
  const resolvedEventType = rawType ?? resolvedScanType;

  return {
    id,
    kegId: trimString(raw.kegId) ?? "",
    scanType: resolvedScanType,
    type: resolvedEventType,
    label: trimString(raw.label) ?? humanizeToken(resolvedScanType),
    fromLocation: trimString(raw.fromLocation) ?? undefined,
    toLocation: trimString(raw.toLocation) ?? undefined,
    product: trimString(raw.product) ?? undefined,
    batch: trimString(raw.batch) ?? undefined,
    timestamp: normalizeEventTimestamp(raw),
    userId: trimString(raw.userId) ?? undefined,
    notes: trimString(raw.notes) ?? undefined,
    updatedBy: trimString(raw.updatedBy) ?? trimString(raw.createdBy) ?? "unknown",
  };
}

function normalizeKeg(id: string, raw: Record<string, unknown>): Keg {
  const legacyStatus = trimString(raw.status);
  const resolvedStatus = normalizeStatusLabel(trimString(raw.currentStatus) ?? legacyStatus);
  const productName = (raw.productName as string | undefined) ?? (raw.beerName as string | undefined) ?? (raw.product as string | undefined);
  const batchNumber = (raw.batchNumber as string | undefined) ?? (raw.batch as string | undefined);
  const filledAt = toIsoString(raw.filledAt) ?? (raw.packagingDate as string | undefined) ?? null;
  const bestBefore = toIsoString(raw.bestBefore) ?? (raw.bestBeforeDate as string | undefined) ?? null;
  const lastUpdatedAt = (raw.lastUpdatedAt as string | undefined) ?? (raw.lastUpdated as string | undefined) ?? (raw.updatedAt as string | undefined) ?? undefined;
  const currentLocation = trimString(raw.currentLocation) ?? trimString(raw.locationId) ?? "Brewery";

  return {
    id,
    kegId: (raw.kegId as string | undefined) ?? id,
    name: (raw.name as string | undefined) ?? (raw.kegId as string | undefined) ?? id,
    qrCode: (raw.qrCode as string | undefined) ?? (raw.qrCodeValue as string | undefined) ?? "",
    currentStatus: resolvedStatus,
    status: trimString(raw.status) ?? resolvedStatus,
    washedAt: toIsoString(raw.washedAt) ?? toIsoString(raw.lastWashAt) ?? null,
    filledAt,
    bestBefore,
    productName,
    batchNumber,
    currentLocation,
    intendedLocation: trimString(raw.intendedLocation),
    returnLocation: trimString(raw.returnLocation),
    serialNumber: trimString(raw.serialNumber),
    assetNumber: trimString(raw.assetNumber),
    ownerName: trimString(raw.ownerName) ?? trimString(raw.owner),
    leaseName: trimString(raw.leaseName) ?? trimString(raw.leaseHolder),
    dateOfManufacture: trimString(raw.dateOfManufacture),
    inMaintenance: typeof raw.inMaintenance === "boolean" ? raw.inMaintenance : normalizeStatusLabel(trimString(raw.currentStatus) ?? legacyStatus) === "In Maintenance",
    isLost: typeof raw.isLost === "boolean" ? raw.isLost : normalizeStatusLabel(trimString(raw.currentStatus) ?? legacyStatus) === "Lost",
    lastWashAt: toIsoString(raw.lastWashAt) ?? toIsoString(raw.washedAt) ?? null,
    lastFillAt: toIsoString(raw.lastFillAt) ?? filledAt,
    readyForPickupAt: toIsoString(raw.readyForPickupAt) ?? null,
    palletizedAt: toIsoString(raw.palletizedAt) ?? null,
    checkedInAt: toIsoString(raw.checkedInAt) ?? null,
    checkedOutAt: toIsoString(raw.checkedOutAt) ?? null,
    updatedAt: toIsoString(raw.updatedAt) ?? lastUpdatedAt ?? null,
    assignedCustomerId: trimString(raw.assignedCustomerId),
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

function kegEventsCollection(kegId: string) {
  return collection(db, "kegs", kegId, "events");
}

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

export async function getKegEvents(kegId: string): Promise<KegEvent[]> {
  const eventQuery = query(kegEventsCollection(kegId), orderBy("timestamp", "desc"));
  const snap = await getDocs(eventQuery);
  return snap.docs.map((eventDoc) => normalizeKegEvent(eventDoc.id, eventDoc.data()));
}

export async function updateKeg(id: string, payload: Record<string, unknown>) {
  return updateDoc(doc(db, "kegs", id), payload);
}

function getFormValue(formData: Record<string, unknown> | undefined, key: string) {
  return trimString(formData?.[key]);
}

function requireFormValue(formData: Record<string, unknown> | undefined, key: string, label: string) {
  const value = getFormValue(formData, key);
  if (!value) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function normalizeDateInput(value: string, label: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} must be a valid date.`);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return parsed.toISOString().split("T")[0];
}

function buildKegPatchWithTimestamp(timestamp: string, patch: Record<string, unknown>) {
  return {
    ...patch,
    updatedAt: timestamp,
    lastUpdatedAt: timestamp,
    lastUpdated: timestamp,
  };
}

function buildScanEventForKeg(keg: Keg, input: RecordKegScanInput, timestamp: string) {
  const formData = input.formData ?? {};
  const notes = trimString(input.notes) ?? getFormValue(formData, "notes");
  const location = getFormValue(formData, "currentLocation");
  const destination = getFormValue(formData, "destination") ?? getFormValue(formData, "nextLocation");
  const customerName = getFormValue(formData, "customerName");
  const batchNumber = getFormValue(formData, "batchNumber") ?? getFormValue(formData, "batch");

  let metadata: Record<string, unknown> = {};
  let updates: Record<string, unknown>;

  switch (input.scanType) {
    case "CHECK_IN":
      metadata = {
        ...(location ? { currentLocation: location } : {}),
        ...(getFormValue(formData, "receivedBy") ? { receivedBy: getFormValue(formData, "receivedBy") } : {}),
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        currentStatus: "Checked In",
        status: "Checked In",
        checkedInAt: timestamp,
        ...(location ? { currentLocation: location } : {}),
      });
      break;
    case "CHECK_OUT":
      metadata = {
        ...(destination ? { destination } : {}),
        ...(customerName ? { customerName } : {}),
        ...(getFormValue(formData, "dispatchNote") ? { dispatchNote: getFormValue(formData, "dispatchNote") } : {}),
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        currentStatus: "Checked Out",
        status: "Checked Out",
        checkedOutAt: timestamp,
      });
      break;
    case "WASH":
      metadata = {
        ...(getFormValue(formData, "washType") ? { washType: getFormValue(formData, "washType") } : {}),
        ...(getFormValue(formData, "operator") ? { operator: getFormValue(formData, "operator") } : {}),
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        currentStatus: "Washed",
        status: "Washed",
        lastWashAt: timestamp,
        washedAt: timestamp,
      });
      break;
    case "FILL": {
      const resolvedProductName = requireFormValue(formData, "productName", "Product name");
      const resolvedBestBefore = normalizeDateInput(requireFormValue(formData, "bestBefore", "Best before date"), "Best before date");
      const resolvedBatchNumber = batchNumber;
      const packagingDate = getFormValue(formData, "packagingDate") ?? timestamp;

      metadata = {
        productName: resolvedProductName,
        ...(resolvedBatchNumber ? { batchNumber: resolvedBatchNumber } : {}),
        bestBeforeDate: resolvedBestBefore,
        ...(getFormValue(formData, "filledVolume") ? { filledVolume: getFormValue(formData, "filledVolume") } : {}),
        ...(location ? { currentLocation: location } : {}),
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        currentStatus: "Filled",
        status: "Filled",
        lastFillAt: timestamp,
        filledAt: timestamp,
        bestBefore: resolvedBestBefore,
        bestBeforeDate: resolvedBestBefore,
        productName: resolvedProductName,
        product: resolvedProductName,
        beerName: resolvedProductName,
        batchNumber: resolvedBatchNumber ?? null,
        batch: resolvedBatchNumber ?? null,
        packagingDate,
      });
      break;
    }
    case "READY_FOR_PICKUP":
      metadata = {};
      updates = buildKegPatchWithTimestamp(timestamp, {
        currentStatus: "Ready for Pickup",
        status: "Ready for Pickup",
        readyForPickupAt: timestamp,
      });
      break;
    case "PALLETIZE":
      metadata = {};
      updates = buildKegPatchWithTimestamp(timestamp, {
        currentStatus: "Palletized",
        status: "Palletized",
        palletizedAt: timestamp,
      });
      break;
    case "CHANGE_RETURN_LOCATION": {
      const newReturnLocation = requireFormValue(formData, "returnLocation", "Return location");
      metadata = {
        previousReturnLocation: keg.returnLocation ?? null,
        newReturnLocation,
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        returnLocation: newReturnLocation,
      });
      break;
    }
    case "INTO_MAINTENANCE":
      metadata = {
        ...(getFormValue(formData, "reason") ? { reason: getFormValue(formData, "reason") } : {}),
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        inMaintenance: true,
        currentStatus: "In Maintenance",
        status: "In Maintenance",
      });
      break;
    case "OUT_OF_MAINTENANCE":
      metadata = {
        ...(getFormValue(formData, "repairNotes") ? { repairNotes: getFormValue(formData, "repairNotes") } : {}),
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        inMaintenance: false,
        currentStatus: "Available",
        status: "Available",
      });
      break;
    case "LOST":
      metadata = {
        ...(getFormValue(formData, "lastKnownLocation") ? { lastKnownLocation: getFormValue(formData, "lastKnownLocation") } : {}),
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        isLost: true,
        currentStatus: "Lost",
        status: "Lost",
      });
      break;
    case "CHANGE_DATE_OF_MANUFACTURE": {
      const newDateOfManufacture = normalizeDateInput(requireFormValue(formData, "dateOfManufacture", "Date of manufacture"), "Date of manufacture");
      metadata = {
        previousDateOfManufacture: keg.dateOfManufacture ?? null,
        newDateOfManufacture,
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        dateOfManufacture: newDateOfManufacture,
      });
      break;
    }
    case "CHANGE_OF_LEASE": {
      const newLeaseName = requireFormValue(formData, "leaseName", "Lease name");
      metadata = {
        previousLeaseName: keg.leaseName ?? null,
        newLeaseName,
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        leaseName: newLeaseName,
      });
      break;
    }
    case "CHANGE_OF_OWNER": {
      const newOwnerName = requireFormValue(formData, "ownerName", "Owner name");
      metadata = {
        previousOwnerName: keg.ownerName ?? null,
        newOwnerName,
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        ownerName: newOwnerName,
      });
      break;
    }
    case "CHANGE_SERIAL_NUMBER": {
      const newSerialNumber = requireFormValue(formData, "serialNumber", "Serial number");
      metadata = {
        previousSerialNumber: keg.serialNumber ?? null,
        newSerialNumber,
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        serialNumber: newSerialNumber,
      });
      break;
    }
    case "CHANGE_ASSET_NUMBER": {
      const newAssetNumber = requireFormValue(formData, "assetNumber", "Asset number");
      metadata = {
        previousAssetNumber: keg.assetNumber ?? null,
        newAssetNumber,
      };
      updates = buildKegPatchWithTimestamp(timestamp, {
        assetNumber: newAssetNumber,
      });
      break;
    }
    default:
      throw new Error("Unsupported scan type.");
  }

  const event = {
    type: input.scanType,
    label: KEG_SCAN_LABELS[input.scanType],
    timestamp,
    userId: trimString(input.userId) ?? null,
    userName: trimString(input.userName) ?? null,
    notes,
    metadata,
  };

  return { event, updates };
}

function buildMovementMirror(keg: Keg, event: Omit<KegEvent, "id">, updates: Record<string, unknown>): Omit<Movement, "id"> {
  const metadata = event.metadata;
  const nextLocation =
    trimString(metadata.newReturnLocation)
    ?? trimString(metadata.destination)
    ?? trimString(metadata.currentLocation)
    ?? (typeof updates.currentLocation === "string" ? updates.currentLocation : null);

  return {
    kegId: keg.kegId ?? keg.id,
    scanType: event.type,
    type: event.type,
    label: event.label,
    fromLocation: keg.currentLocation ?? undefined,
    toLocation: nextLocation ?? undefined,
    product: trimString(metadata.productName) ?? keg.productName ?? keg.product ?? undefined,
    batch: trimString(metadata.batchNumber) ?? keg.batchNumber ?? keg.batch ?? undefined,
    timestamp: event.timestamp,
    userId: event.userId ?? undefined,
    notes: event.notes ?? undefined,
    updatedBy: event.userName ?? "unknown",
  };
}

export async function recordKegScanEvent(input: RecordKegScanInput): Promise<void> {
  if (!isKegScanType(input.scanType)) {
    throw new Error("Unsupported scan type.");
  }

  const kegRef = doc(db, "kegs", input.kegId);
  const eventRef = doc(kegEventsCollection(input.kegId));
  const movementRef = doc(collections.movements);

  await runTransaction(db, async (transaction) => {
    const kegSnap = await transaction.get(kegRef);
    if (!kegSnap.exists()) {
      throw new Error("Keg not found.");
    }

    const keg = normalizeKeg(kegSnap.id, kegSnap.data());
    const timestamp = new Date().toISOString();
    const { event, updates } = buildScanEventForKeg(keg, input, timestamp);
    const mirrorMovement = buildMovementMirror(keg, event, updates);

    transaction.set(eventRef, event);
    transaction.update(kegRef, updates);
    transaction.set(movementRef, {
      ...mirrorMovement,
      createdAt: serverTimestamp(),
    });
  });
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
  const resolvedStatus: Keg["currentStatus"] = resolvedProductName ? "Filled" : "Empty";

  const keg: Omit<Keg, "id"> = {
    kegId,
    name: kegId,
    qrCode,
    currentStatus: resolvedStatus,
    status: resolvedStatus,
    washedAt: null,
    lastWashAt: null,
    filledAt: resolvedFilledAt,
    lastFillAt: resolvedFilledAt,
    bestBefore: resolvedBestBefore,
    productName: resolvedProductName ?? null,
    batchNumber: resolvedBatchNumber ?? null,
    currentLocation,
    intendedLocation,
    returnLocation: null,
    serialNumber: null,
    assetNumber: null,
    ownerName: "B Effect Brewing",
    leaseName: payload.assignedCustomerId?.trim() || null,
    dateOfManufacture: null,
    inMaintenance: false,
    isLost: false,
    readyForPickupAt: null,
    palletizedAt: null,
    checkedInAt: null,
    checkedOutAt: null,
    updatedAt: now,
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

    // transaction.set() throws on undefined values; strip them before writing.
    const kegData = Object.fromEntries(
      Object.entries(keg).filter(([, v]) => v !== undefined),
    );
    transaction.set(kegRef, kegData);
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
      currentStatus: "Washed",
      status: "Washed",
      washedAt: now,
      lastWashAt: now,
      filledAt: null,
      lastFillAt: null,
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
      fromLocation: keg.currentLocation ?? undefined,
      toLocation: keg.currentLocation ?? undefined,
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
      currentStatus: "Filled",
      status: "Filled",
      filledAt: now,
      lastFillAt: now,
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
      fromLocation: keg.currentLocation ?? undefined,
      toLocation: keg.currentLocation ?? undefined,
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
      currentStatus: "Delivered",
      status: "Delivered",
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
      fromLocation: keg.currentLocation ?? undefined,
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
