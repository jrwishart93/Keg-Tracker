export type KegStatus =
  | "on_site"
  | "off_site"
  | "empty"
  | "maintenance"
  | "lost"
  | "ready_for_pickup";

export interface Keg {
  id: string;
  qrCodeValue: string;
  status: KegStatus;
  locationId: string;
  productId?: string;
  beerName?: string;
  batch?: string;
  updatedAt?: string;
}
