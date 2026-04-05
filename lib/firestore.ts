import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Keg } from "@/types/keg";
import type { Location } from "@/types/location";
import type { Movement } from "@/types/movement";
import type { AppUser } from "@/types/user";

export const collections = {
  users: collection(db, "users"),
  kegs: collection(db, "kegs"),
  locations: collection(db, "locations"),
  products: collection(db, "products"),
  movements: collection(db, "movements"),
};

export async function getUserById(uid: string): Promise<AppUser | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return { uid: snap.id, ...(snap.data() as Omit<AppUser, "uid">) };
}

export async function getKegs(): Promise<Keg[]> {
  const snap = await getDocs(collections.kegs);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Keg, "id">) }));
}

export async function getKegByQr(qrCodeValue: string): Promise<Keg | null> {
  const q = query(collections.kegs, where("qrCodeValue", "==", qrCodeValue), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  return { id: first.id, ...(first.data() as Omit<Keg, "id">) };
}

export async function getKegById(id: string): Promise<Keg | null> {
  const kegRef = doc(db, "kegs", id);
  const snap = await getDoc(kegRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Keg, "id">) };
}

export async function updateKeg(id: string, payload: Partial<Keg>) {
  return updateDoc(doc(db, "kegs", id), payload);
}

export async function createMovement(payload: Omit<Movement, "id">) {
  return addDoc(collections.movements, payload);
}

export async function getMovementsByKeg(kegId: string): Promise<Movement[]> {
  const q = query(collections.movements, where("kegId", "==", kegId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Movement, "id">) }));
}

export async function getRecentMovements(max = 20): Promise<Movement[]> {
  const q = query(collections.movements, orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Movement, "id">) }));
}

export async function getLocations(): Promise<Location[]> {
  const snap = await getDocs(collections.locations);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Location, "id">) }));
}

export async function upsertLocation(location: Location) {
  return setDoc(doc(db, "locations", location.id), location, { merge: true });
}
