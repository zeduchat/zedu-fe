import type { PermissionKey } from "~/types/rbac";

export interface ApiPermission {
  key: string;
  name: string;
  category: string;
  description: string;
}

export interface UiPermission {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  locked: boolean;
}

export interface OrgRolePermissions {
  id?: string;
  role_id?: string;
  permission_list?: Record<string, boolean>;
  is_default?: boolean;
}

export interface OrgRoleRecord {
  id: string;
  name: string;
  description?: string;
  organisation_id?: string | null;
  is_default?: boolean;
  permissions?: OrgRolePermissions;
}

/** Maps legacy role permission keys to the current `/permissions` catalog keys. */
export const LEGACY_PERMISSION_KEY_ALIASES: Record<string, string> = {
  can_create_channel: "can_create_channels",
  can_comment_on_threads: "can_comment_threads",
  can_remove_people_from_organization: "can_remove_people",
  can_create_custom_role: "can_create_role",
};

export const normalizePermissionKey = (key: string): string =>
  LEGACY_PERMISSION_KEY_ALIASES[key] ?? key;

export const normalizeRolePermissionList = (
  raw: Record<string, boolean> | null | undefined
): Record<string, boolean> => {
  if (!raw) return {};

  const normalized: Record<string, boolean> = {};
  for (const [key, enabled] of Object.entries(raw)) {
    const canonical = normalizePermissionKey(key);
    normalized[canonical] = Boolean(enabled) || Boolean(normalized[canonical]);
  }
  return normalized;
};

/** Always enabled for new/edited roles; user cannot turn these off. */
export const LOCKED_DEFAULT_PERMISSION_KEYS = new Set([
  "can_invite_members",
  "can_create_channels",
  "can_view_channels",
  "can_comment_threads",
]);

export const formatPermissionCategory = (category: string) =>
  category
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const buildPermissionNameMap = (
  catalog: ApiPermission[] | null | undefined
): Map<string, string> => {
  const map = new Map<string, string>();
  catalog?.forEach((item) => map.set(item.key, item.name));
  return map;
};

export const buildUiPermissions = (
  apiPermissions: ApiPermission[],
  rolePermissions?: Record<string, boolean> | null
): UiPermission[] => {
  const normalizedRole = normalizeRolePermissionList(rolePermissions);

  return apiPermissions.map((item) => {
    const locked = LOCKED_DEFAULT_PERMISSION_KEYS.has(item.key);
    const fromRole = Object.prototype.hasOwnProperty.call(
      normalizedRole,
      item.key
    )
      ? Boolean(normalizedRole[item.key])
      : undefined;

    return {
      id: item.key,
      name: item.name,
      category: item.category || "general",
      description: item.description || "",
      enabled: locked ? true : (fromRole ?? false),
      locked,
    };
  });
};

export const toPermissionListPayload = (
  permissions: UiPermission[]
): Record<string, boolean> =>
  permissions.reduce<Record<string, boolean>>((acc, permission) => {
    if (permission.enabled || permission.locked) {
      acc[permission.id] = true;
    }
    return acc;
  }, {});

export const permissionListToActionLabels = (
  permissionList: Record<string, boolean>,
  nameByKey?: Map<string, string>
): { label: string }[] => {
  const normalized = normalizeRolePermissionList(permissionList);

  return Object.entries(normalized)
    .filter(([, enabled]) => enabled)
    .map(([key]) => ({
      label:
        nameByKey?.get(key) ??
        nameByKey?.get(
          Object.entries(LEGACY_PERMISSION_KEY_ALIASES).find(
            ([, v]) => v === key
          )?.[0] ?? key
        ) ??
        formatPermissionCategory(key.replace(/^can_/, "")),
    }));
};

export interface ResolvedCurrentUserOrgRole {
  roleId: string | null;
  roleName: string | null;
  roleDescription: string;
  roleDefinition: OrgRoleRecord | null;
  permissionList: Record<string, boolean>;
}

export const resolveCurrentUserOrgRole = (params: {
  user?: { user_id?: string; id?: string } | null;
  orgData?: {
    role?: string;
    user_role?: { role_id?: string; role_name?: string };
  } | null;
  orgMembers?: Array<{ user_id?: string; id?: string; role?: string }> | null;
  orgRoles?: OrgRoleRecord[] | null;
  fallbackRoleName?: string | null;
}): ResolvedCurrentUserOrgRole => {
  const userId = params.user?.user_id ?? params.user?.id;

  const member = userId
    ? params.orgMembers?.find(
        (m) => String(m.user_id ?? m.id) === String(userId)
      )
    : undefined;

  const roleIdHint = params.orgData?.user_role?.role_id ?? null;
  const roleNameHint =
    params.orgData?.user_role?.role_name ??
    params.orgData?.role ??
    member?.role ??
    params.fallbackRoleName ??
    null;

  const roleDefinition =
    params.orgRoles?.find((role) => {
      if (roleIdHint && role.id === roleIdHint) return true;
      if (
        roleNameHint &&
        role.name?.toLowerCase() === roleNameHint.toLowerCase()
      ) {
        return true;
      }
      return false;
    }) ?? null;

  const permissionList = normalizeRolePermissionList(
    roleDefinition?.permissions?.permission_list
  );

  return {
    roleId: roleDefinition?.id ?? roleIdHint,
    roleName: roleDefinition?.name ?? roleNameHint,
    roleDescription: roleDefinition?.description ?? "",
    roleDefinition,
    permissionList,
  };
};

export const formatRoleDisplayName = (roleName: string | null | undefined) => {
  if (!roleName) return "";
  if (roleName.includes(" ")) return roleName;
  return roleName
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const findOrgRoleByNameOrId = (
  orgRoles: OrgRoleRecord[] | null | undefined,
  roleHint: string | null | undefined
): OrgRoleRecord | null => {
  if (!roleHint || !orgRoles?.length) return null;
  const lower = roleHint.toLowerCase();
  return (
    orgRoles.find(
      (role) =>
        role.id === roleHint ||
        role.name.toLowerCase() === lower ||
        role.name.toLowerCase().replace(/\s+/g, "_") ===
          lower.replace(/\s+/g, "_")
    ) ?? null
  );
};

export const permissionListToPermissionKeys = (
  permissionList: Record<string, boolean> | null | undefined,
  mapKeyToCanonical: (key: string) => PermissionKey | null
): PermissionKey[] => {
  const normalized = normalizeRolePermissionList(permissionList);
  const keys = new Set<PermissionKey>();

  for (const [key, enabled] of Object.entries(normalized)) {
    if (!enabled) continue;
    const canonical = mapKeyToCanonical(key);
    if (canonical) keys.add(canonical);
  }

  return Array.from(keys);
};
