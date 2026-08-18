"use client";

import React, { forwardRef, ComponentType, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PermissionKey } from "~/types/rbac";
import { useRBAC } from "~/hooks/useRBAC";
import { showError } from "~/components/toast/sonner";
import { DataContext } from "~/store/GlobalState";
import { State } from "centrifuge";

interface WithAuthGateProps {
  requiredPermission: PermissionKey;
  LoadingComponent?: ComponentType<any>;
  unauthorizedMessage?: string;
  redirectTo?: string;
  showErrorToast?: boolean;
  onUnauthorized?: () => void;
}

export function withAuthGate<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthGateProps
) {
  const {
    requiredPermission,
    LoadingComponent,
    unauthorizedMessage = "You don't have permission to access this resource",
    redirectTo,
    showErrorToast = true,
    onUnauthorized,
  } = options;

  const AuthGatedComponent = forwardRef<any, P>((props, ref) => {
    const router = useRouter();
    const { hasPermission, status } = useRBAC();
    const { state } = React.useContext(DataContext);
    const orgSlug = state?.orgSlug;

    const isAuthorized = useMemo(() => {
      if (status === "loading") {
        return false;
      }
      return hasPermission(requiredPermission);
    }, [hasPermission, status]);

    React.useEffect(() => {
      if (status === "authorized" && !isAuthorized) {
        if (onUnauthorized) {
          onUnauthorized();
        }

        if (showErrorToast) {
          showError(unauthorizedMessage);
        }

        const redirectPath = redirectTo || `/${orgSlug || "dashboard"}`;
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      }
    }, [status, isAuthorized, router, orgSlug]);

    if (status === "loading") {
      return LoadingComponent ? (
        <LoadingComponent />
      ) : (
        <div className="flex items-center justify-center h-screen w-full">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-300 rounded-md"></div>
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      return null;
    }

    return <WrappedComponent {...(props as P)} ref={ref} />;
  });

  AuthGatedComponent.displayName = `withAuthGate(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthGatedComponent;
}

export function withAllPermissions<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredPermissions: PermissionKey[],
  options?: Omit<WithAuthGateProps, "requiredPermission">
) {
  const { useAllPermissions } = require("~/hooks/useRBAC");

  const AllPermissionsGatedComponent = forwardRef<any, P>((props, ref) => {
    const router = useRouter();
    const hasAllPerms = useAllPermissions(requiredPermissions);
    const { status } = useRBAC();
    const { state } = React.useContext(DataContext);
    const orgSlug = state?.orgSlug;

    const unauthorizedMessage =
      options?.unauthorizedMessage ||
      `You need all of these permissions: ${requiredPermissions.join(", ")}`;

    React.useEffect(() => {
      if (status === "authorized" && !hasAllPerms) {
        if (options?.onUnauthorized) {
          options.onUnauthorized();
        }

        if (options?.showErrorToast !== false) {
          showError(unauthorizedMessage);
        }

        const redirectPath =
          options?.redirectTo || `/${orgSlug || "dashboard"}`;
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      }
    }, [status, hasAllPerms, router, orgSlug]);

    if (status === "loading") {
      return options?.LoadingComponent ? (
        <options.LoadingComponent />
      ) : (
        <div className="flex items-center justify-center h-screen w-full">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-300 rounded-md"></div>
          </div>
        </div>
      );
    }

    if (!hasAllPerms) {
      return null;
    }

    return <WrappedComponent {...(props as P)} ref={ref} />;
  });

  AllPermissionsGatedComponent.displayName = `withAllPermissions(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AllPermissionsGatedComponent;
}

export function withAnyPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredPermissions: PermissionKey[],
  options?: Omit<WithAuthGateProps, "requiredPermission">
) {
  const { useAnyPermission } = require("~/hooks/useRBAC");

  const AnyPermissionGatedComponent = forwardRef<any, P>((props, ref) => {
    const router = useRouter();
    const hasAnyPerm = useAnyPermission(requiredPermissions);
    const { status } = useRBAC();
    const { state } = React.useContext(DataContext);
    const orgSlug = state?.orgSlug;

    const unauthorizedMessage =
      options?.unauthorizedMessage ||
      `You need at least one of these permissions: ${requiredPermissions.join(", ")}`;

    React.useEffect(() => {
      if (status === "authorized" && !hasAnyPerm) {
        if (options?.onUnauthorized) {
          options.onUnauthorized();
        }

        if (options?.showErrorToast !== false) {
          showError(unauthorizedMessage);
        }

        const redirectPath =
          options?.redirectTo || `/${orgSlug || "dashboard"}`;
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      }
    }, [status, hasAnyPerm, router, orgSlug]);

    if (status === "loading") {
      return options?.LoadingComponent ? (
        <options.LoadingComponent />
      ) : (
        <div className="flex items-center justify-center h-screen w-full">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-300 rounded-md"></div>
          </div>
        </div>
      );
    }

    if (!hasAnyPerm) {
      return null;
    }

    return <WrappedComponent {...(props as P)} ref={ref} />;
  });

  AnyPermissionGatedComponent.displayName = `withAnyPermission(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AnyPermissionGatedComponent;
}

export default withAuthGate;
