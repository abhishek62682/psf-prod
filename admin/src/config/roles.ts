// Matches the NGO backend's Admin.role field (see README.md).
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
export type Role = UserRole;

// Convenience groups for use with <RoleGuard allowedRoles={ROLE_GROUPS.X} />
export const ROLE_GROUPS = {
  ALL: [ROLES.SUPER_ADMIN, ROLES.ADMIN] as const,
  SUPER_ADMIN_ONLY: [ROLES.SUPER_ADMIN] as const,
} as const;
