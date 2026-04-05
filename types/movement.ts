export type MovementAction =
  | "check_in"
  | "check_out"
  | "fill"
  | "empty"
  | "ready_for_pickup"
  | "maintenance"
  | "lost";

export interface Movement {
  id: string;
  kegId: string;
  action: MovementAction;
  fromLocationId?: string;
  toLocationId?: string;
  notes?: string;
  createdBy: string;
  createdAt?: string;
}
