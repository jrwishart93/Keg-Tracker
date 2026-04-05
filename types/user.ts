export type UserRole = "admin" | "staff";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}
