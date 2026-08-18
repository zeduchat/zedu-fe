"use client";

import React, { ReactNode, useMemo } from "react";
import type { PermissionKey } from "~/types/rbac";
import { useRBAC, useAllPermissions, useAnyPermission } from "~/hooks/useRBAC";
import Loading from "~/components/ui/loading";
import {
  ACCESS_DENIED_COPY,
  type PermissionRequirement,
} from "~/config/access-control";

type RequirePermissionProps = {
  permission?: PermissionKey;
  anyOf?: PermissionKey[];
  allOf?: PermissionKey[];
  requirement?: PermissionRequirement;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  /** When false, renders fallback instead of null while unauthorized. */
  hideOnly?: boolean;
};

export const evaluatePermissionRequirement = (
  requirement: PermissionRequirement | undefined,
  hasPermission: (key: PermissionKey) => boolean,
  hasAny: (keys: PermissionKey[]) => boolean,
  hasAll: (keys: PermissionKey[]) => boolean
): boolean => {
  if (!requirement) return true;

  if (typeof requirement === "string") {
    return hasPermission(requirement);
  }

  if ("anyOf" in requirement) {
    return hasAny(requirement.anyOf);
  }

  return hasAll(requirement.allOf);
};

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  anyOf,
  allOf,
  requirement,
  children,
  fallback = null,
  loadingFallback,
  hideOnly = true,
}) => {
  const { hasPermission, status } = useRBAC();
  const anyPermissions = useAnyPermission(anyOf ?? []);
  const allPermissions = useAllPermissions(allOf ?? []);

  const resolvedRequirement = useMemo((): PermissionRequirement | undefined => {
    if (requirement) return requirement;
    if (permission) return permission;
    if (anyOf?.length) return { anyOf };
    if (allOf?.length) return { allOf };
    return undefined;
  }, [requirement, permission, anyOf, allOf]);

  const allowed = useMemo(() => {
    if (status !== "authorized") return false;

    if (!resolvedRequirement) {
      if (anyOf?.length) return anyPermissions;
      if (allOf?.length) return allPermissions;
      if (permission) return hasPermission(permission);
      return true;
    }

    return evaluatePermissionRequirement(
      resolvedRequirement,
      hasPermission,
      (keys) => keys.some((key) => hasPermission(key)),
      (keys) => keys.every((key) => hasPermission(key))
    );
  }, [
    status,
    resolvedRequirement,
    hasPermission,
    anyOf,
    allOf,
    permission,
    anyPermissions,
    allPermissions,
  ]);

  if (status === "loading") {
    return (
      <>
        {loadingFallback ?? (
          <div className="flex justify-center py-12">
            <Loading color="#7141F8" />
          </div>
        )}
      </>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  if (!hideOnly && fallback) {
    return <>{fallback}</>;
  }

  return hideOnly ? null : <>{fallback}</>;
};

type AccessDeniedPanelProps = {
  title?: string;
  description?: string;
  className?: string;
};

export const AccessDeniedPanel: React.FC<AccessDeniedPanelProps> = ({
  title = ACCESS_DENIED_COPY.title,
  description = ACCESS_DENIED_COPY.description,
  className = "",
}) => (
  <div
    className={`rounded-2xl border border-[#E6EAEF] bg-[#F9FAFB] p-10 text-center max-w-lg ${className}`}
  >
    <h2 className="text-lg font-bold text-[#101828]">{title}</h2>
    <p className="text-sm text-[#667085] mt-2">{description}</p>
  </div>
);

export default RequirePermission;
