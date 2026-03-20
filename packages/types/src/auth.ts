export type UserRole = "admin" | "team_member" | "viewer";

export interface AppUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface TabAccess {
  chat: boolean;
  life: boolean;
  business: boolean;
  admin: boolean;
}

export const ROLE_ACCESS: Record<UserRole, TabAccess> = {
  admin: { chat: true, life: true, business: true, admin: true },
  team_member: { chat: false, life: false, business: true, admin: false },
  viewer: { chat: false, life: false, business: true, admin: false },
};
