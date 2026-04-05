export type KegStatus =
  | "Available"
  | "Checked In"
  | "Checked Out"
  | "Delivered"
  | "Empty"
  | "Filled"
  | "In Maintenance"
  | "Lost"
  | "Palletized"
  | "Ready for Pickup"
  | "Returned"
  | "Washed";

export interface Keg {
  id: string;
  kegId?: string;
  name?: string;
  qrCode: string;
  currentStatus: KegStatus;
  status?: string | null;
  washedAt?: string | null;
  filledAt?: string | null;
  bestBefore?: string | null;
  productName?: string | null;
  batchNumber?: string | null;
  currentLocation: string | null;
  intendedLocation?: string | null;
  returnLocation?: string | null;
  serialNumber?: string | null;
  assetNumber?: string | null;
  ownerName?: string | null;
  leaseName?: string | null;
  dateOfManufacture?: string | null;
  inMaintenance?: boolean;
  isLost?: boolean;
  lastWashAt?: string | null;
  lastFillAt?: string | null;
  readyForPickupAt?: string | null;
  palletizedAt?: string | null;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  updatedAt?: string | null;
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
