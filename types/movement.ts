export type MovementAction = "fill" | "deliver" | "return" | "empty" | "maintenance" | "lost";

export interface Movement {
  id: string;
  kegId: string;
  scanType: MovementAction;
  fromLocation?: string;
  toLocation?: string;
  product?: string;
  batch?: string;
  timestamp?: string;
  notes?: string;
  updatedBy: string;
}
