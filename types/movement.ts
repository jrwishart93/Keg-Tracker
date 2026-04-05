export interface Movement {
  id: string;
  kegId: string;
  scanType: string;
  type?: string;
  label?: string;
  fromLocation?: string;
  toLocation?: string;
  product?: string;
  batch?: string;
  timestamp?: string;
  userId?: string;
  notes?: string;
  updatedBy: string;
}
