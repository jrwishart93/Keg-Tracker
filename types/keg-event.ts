export const KEG_SCAN_TYPES = [
  "CHECK_IN",
  "CHECK_OUT",
  "WASH",
  "FILL",
  "READY_FOR_PICKUP",
  "PALLETIZE",
  "CHANGE_RETURN_LOCATION",
  "INTO_MAINTENANCE",
  "OUT_OF_MAINTENANCE",
  "LOST",
  "CHANGE_DATE_OF_MANUFACTURE",
  "CHANGE_OF_LEASE",
  "CHANGE_OF_OWNER",
  "CHANGE_SERIAL_NUMBER",
  "CHANGE_ASSET_NUMBER",
] as const;

export type KegScanType = (typeof KEG_SCAN_TYPES)[number];

export const KEG_SCAN_LABELS: Record<KegScanType, string> = {
  CHECK_IN: "Check In",
  CHECK_OUT: "Check Out",
  WASH: "Wash",
  FILL: "Fill",
  READY_FOR_PICKUP: "Ready for Pickup",
  PALLETIZE: "Palletize",
  CHANGE_RETURN_LOCATION: "Change Return Location",
  INTO_MAINTENANCE: "Into Maintenance",
  OUT_OF_MAINTENANCE: "Out of Maintenance",
  LOST: "Lost",
  CHANGE_DATE_OF_MANUFACTURE: "Change Date of Manufacture",
  CHANGE_OF_LEASE: "Change of Lease",
  CHANGE_OF_OWNER: "Change of Owner",
  CHANGE_SERIAL_NUMBER: "Change Serial Number",
  CHANGE_ASSET_NUMBER: "Change Asset Number",
};

export interface KegEvent {
  id: string;
  type: KegScanType;
  label: string;
  timestamp: string;
  userId: string | null;
  userName: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
}

export type RecordKegScanInput = {
  kegId: string;
  scanType: KegScanType;
  userId?: string | null;
  userName?: string | null;
  notes?: string | null;
  formData?: Record<string, unknown>;
};

export function isKegScanType(value: string): value is KegScanType {
  return KEG_SCAN_TYPES.includes(value as KegScanType);
}
