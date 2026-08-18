"use client";

import React, { ReactNode } from "react";
import type { PermissionKey } from "~/types/rbac";
import { useRBAC } from "~/hooks/useRBAC";

interface PermissionBoundaryProps {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
  onUnauthorized?: () => void;
  renderChildren?: (canAccess: boolean) => ReactNode;
  debug?: boolean;
}

export const PermissionBoundary: React.FC<PermissionBoundaryProps> = ({
  permission,
  children,
  fallback = null,
  onUnauthorized,
  renderChildren,
  debug = false,
}) => {
  const { hasPermission, status, userRole } = useRBAC();

  const canAccess = hasPermission(permission);

  React.useEffect(() => {
    if (!canAccess && status === "authorized" && onUnauthorized) {
      onUnauthorized();
    }
  }, [canAccess, status, onUnauthorized]);

  if (debug && process.env.NODE_ENV === "development") {
    console.log("[PermissionBoundary]", {
      permission,
      canAccess,
      status,
      userRole,
    });
  }

  if (renderChildren) {
    return <>{renderChildren(canAccess)}</>;
  }

  if (canAccess) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return null;
  }

  return <>{fallback}</>;
};

interface PermissionListProps {
  items: Array<{
    key: string | number;
    permission: PermissionKey;
    children: ReactNode;
  }>;
  emptyFallback?: ReactNode;
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

export const PermissionList: React.FC<PermissionListProps> = ({
  items,
  emptyFallback = null,
  wrapper: Wrapper,
}) => {
  const { hasPermission, status } = useRBAC();

  const authorizedItems = items.filter((item) =>
    hasPermission(item.permission)
  );

  if (status === "loading") {
    return null;
  }

  if (authorizedItems.length === 0) {
    return <>{emptyFallback}</>;
  }

  return (
    <>
      {authorizedItems.map((item) => (
        <React.Fragment key={item.key}>
          {Wrapper ? <Wrapper>{item.children}</Wrapper> : item.children}
        </React.Fragment>
      ))}
    </>
  );
};

export default PermissionBoundary;
