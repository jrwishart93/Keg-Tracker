export type UserRole = "admin" | "staff" | "developer";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  requiresPasswordChange: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}
