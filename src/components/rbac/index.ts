/**
 * RBAC System Barrel Exports
 * Exports all RBAC-related components, hooks, and utilities
 */

export {
  useRBAC,
  useRBACWithStatus,
  useAllPermissions,
  useAnyPermission,
} from "~/hooks/useRBAC";

export { PermissionBoundary, PermissionList } from "./PermissionBoundary";
export {
  RequirePermission,
  AccessDeniedPanel,
  evaluatePermissionRequirement,
} from "./RequirePermission";
export { SettingsOrganisationRouteGuard } from "./SettingsOrganisationRouteGuard";
export {
  withAuthGate,
  withAllPermissions,
  withAnyPermission,
} from "./withAuthGate";

export {
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  isPrivilegedRole,
  getRoleHierarchyLevel,
  isRoleHigherThan,
  checkPermission,
  permissionsToSet,
  isValidOrgData,
  extractRoleAndPermissions,
  performPermissionCheck,
  getEffectivePermissions,
  hasAnyPermission,
  hasAllPermissions,
  getCustomRolePermissions,
  resolveRolePermissions,
} from "~/utils/rbac";

export type {
  UserRole,
  PredefinedRole,
  PermissionKey,
  RBACStatus,
  RBACContextValue,
  Permission,
  OrgData,
  CustomRole,
  RoleHierarchy,
  RolePermissionsMap,
  WithAuthGateProps,
  PermissionBoundaryProps,
  PermissionCheckResult,
} from "~/types/rbac";
