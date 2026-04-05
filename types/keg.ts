export type KegStatus = "empty" | "washed" | "filled" | "delivered" | "returned" | "maintenance" | "lost";

export interface Keg {
  id: string;
  kegId?: string;
  name?: string;
  qrCode: string;
  currentStatus: KegStatus;
  status?: KegStatus;
  washedAt?: string | null;
  filledAt?: string | null;
  bestBefore?: string | null;
  productName?: string | null;
  batchNumber?: string | null;
  currentLocation: string;
  intendedLocation?: string;
  assignedCustomerId?: string | null;
  product?: string;
  batch?: string;
  beerName?: string;
  abv?: number;
  packagingDate?: string;
  bestBeforeDate?: string;
  lastUpdatedAt?: string;
  lastUpdated?: string;
  createdAt?: string;
}
