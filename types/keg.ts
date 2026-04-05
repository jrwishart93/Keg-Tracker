export type KegStatus = "filled" | "delivered" | "returned" | "empty" | "maintenance" | "lost";

export interface Keg {
  id: string;
  kegId?: string;
  qrCode: string;
  currentStatus: KegStatus;
  currentLocation: string;
  intendedLocation?: string;
  product?: string;
  batch?: string;
  beerName?: string;
  abv?: number;
  packagingDate?: string;
  bestBeforeDate?: string;
  lastUpdatedAt?: string;
  createdAt?: string;
}
