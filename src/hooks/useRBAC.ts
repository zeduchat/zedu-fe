"use client";

import { useContext, useMemo } from "react";
import type {
  UserRole,
  PermissionKey,
  RBACStatus,
  RBACContextValue,
  OrgData,
} from "~/types/rbac";
import {
  checkPermission,
  extractRoleAndPermissions,
  isPrivilegedRole,
  permissionsToSet,
  isValidOrgData,
} from "~/utils/rbac";
import { DataContext } from "~/store/GlobalState";

export const useRBAC = (): RBACContextValue => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useRBAC must be used within DataProvider");
  }

  const { state } = context;

  const orgData = state?.orgData as OrgData | null;
  const orgRoles = state?.orgRoles ?? null;
  const isDataLoading = !orgData || orgData === null;

  const { userRole, permissions, status } = useMemo(() => {
    if (isDataLoading) {
      return {
        userRole: null,
        permissions: new Set<PermissionKey>(),
        status: "loading" as RBACStatus,
      };
    }

    if (!isValidOrgData(orgData)) {
      return {
        userRole: null,
        permissions: new Set<PermissionKey>(),
        status: "loading" as RBACStatus,
      };
    }

    const { role, permissions: permArray } = extractRoleAndPermissions(
      orgData,
      "guest",
      orgRoles
    );
    const permissionSet = permissionsToSet(permArray);

    return {
      userRole: role,
      permissions: permissionSet,
      status: "authorized" as RBACStatus,
    };
  }, [orgData, isDataLoading, orgRoles]);

  const hasPermission = useMemo(() => {
    return (permission: PermissionKey): boolean => {
      if (status === "loading") {
        return false;
      }

      if (isPrivilegedRole(userRole)) {
        return true;
      }

      if (permissions.has(permission)) {
        return true;
      }

      return false;
    };
  }, [status, userRole, permissions]);

  const isPrivileged = useMemo(() => {
    return isPrivilegedRole(userRole);
  }, [userRole]);

  return {
    status,
    userRole,
    permissions,
    hasPermission,
    isPrivileged,
  };
};

export const useRBACWithStatus = () => {
  const rbac = useRBAC();

  const checkPermissionWithStatus = useMemo(() => {
    return (
      permission: PermissionKey
    ): {
      allowed: boolean;
      status: RBACStatus;
    } => {
      return {
        allowed: rbac.hasPermission(permission),
        status: rbac.status,
      };
    };
  }, [rbac]);

  return {
    ...rbac,
    checkPermissionWithStatus,
  };
};

export const useAllPermissions = (
  requiredPermissions: PermissionKey[]
): boolean => {
  const { hasPermission, status } = useRBAC();

  return useMemo(() => {
    if (status !== "authorized") {
      return false;
    }

    return requiredPermissions.every((perm) => hasPermission(perm));
  }, [requiredPermissions, hasPermission, status]);
};

export const useAnyPermission = (
  requiredPermissions: PermissionKey[]
): boolean => {
  const { hasPermission, status } = useRBAC();

  return useMemo(() => {
    if (status !== "authorized") {
      return false;
    }

    return requiredPermissions.some((perm) => hasPermission(perm));
  }, [requiredPermissions, hasPermission, status]);
};
