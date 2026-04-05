export type MovementEventType = "wash" | "fill" | "delivery" | "return" | "empty" | "maintenance" | "lost" | "customer_request";
export type StaffMovementAction = "wash" | "fill" | "deliver" | "return" | "empty" | "maintenance" | "lost";
export type CustomerMovementAction = "customer_request";
export type MovementAction = StaffMovementAction | CustomerMovementAction;

export interface Movement {
  id: string;
  kegId: string;
  scanType: MovementAction;
  type?: MovementEventType;
  fromLocation?: string;
  toLocation?: string;
  product?: string;
  batch?: string;
  timestamp?: string;
  userId?: string;
  notes?: string;
  updatedBy: string;
}
