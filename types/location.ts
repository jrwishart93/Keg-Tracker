export interface Location {
  id: string;
  name: string;
  type: "brewery" | "venue" | "van" | "customer";
  address?: string;
  active: boolean;
}
