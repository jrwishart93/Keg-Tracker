export type CustomerRequestType = "reorder" | "refill" | "replace";
export type CustomerRequestStatus = "pending" | "completed";

export interface CustomerRequest {
  id: string;
  kegId: string;
  requestType: CustomerRequestType;
  customerName?: string;
  customerContact?: string;
  createdAt?: string;
  status: CustomerRequestStatus;
}
