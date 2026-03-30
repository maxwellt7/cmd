import type { UserRole, TabAccess } from "@cmd/types";

export const ROLE_ACCESS: Record<UserRole, TabAccess> = {
  admin: { chat: true, life: true, business: true, admin: true },
  team_member: { chat: true, life: true, business: true, admin: false },
  viewer: { chat: true, life: true, business: true, admin: false },
};

export function canAccessTab(role: UserRole, tab: keyof TabAccess): boolean {
  return ROLE_ACCESS[role][tab];
}

export function getAccessibleTabs(role: UserRole): (keyof TabAccess)[] {
  const access = ROLE_ACCESS[role];
  return (Object.keys(access) as (keyof TabAccess)[]).filter((tab) => access[tab]);
}
