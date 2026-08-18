"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";
import SettingsLabel from "~/app/(client)/[org]/settings/components/settings-label";
import {
  evaluatePermissionRequirement,
  AccessDeniedPanel,
} from "~/components/rbac/RequirePermission";
import {
  getOrganisationSettingsAccessRule,
  getOrganisationSettingsSegment,
} from "~/config/access-control";
import { useRBAC } from "~/hooks/useRBAC";
import { DataContext } from "~/store/GlobalState";
import Loading from "~/components/ui/loading";
import { showError } from "~/components/toast/sonner";

type SettingsOrganisationRouteGuardProps = {
  children: React.ReactNode;
};

/**
 * Guards `/settings/organisation/*` routes using API-backed permissions.
 * Personal settings routes are always allowed for authenticated users.
 */
export function SettingsOrganisationRouteGuard({
  children,
}: SettingsOrganisationRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useContext(DataContext);
  const orgSlug = state?.orgSlug;
  const { hasPermission, status } = useRBAC();

  const segment = getOrganisationSettingsSegment(pathname);
  const accessRule = getOrganisationSettingsAccessRule(segment);

  const allowed =
    status === "authorized" &&
    evaluatePermissionRequirement(
      accessRule ?? undefined,
      hasPermission,
      (keys) => keys.some((key) => hasPermission(key)),
      (keys) => keys.every((key) => hasPermission(key))
    );

  useEffect(() => {
    if (status !== "authorized" || !segment || allowed) return;

    showError("You don't have permission to access this settings page");
    const redirect = orgSlug
      ? `/${orgSlug}/settings/personal/account`
      : "/auth/login";
    const timer = window.setTimeout(() => router.replace(redirect), 800);
    return () => window.clearTimeout(timer);
  }, [status, segment, allowed, orgSlug, router]);

  if (!segment) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center py-24">
        <Loading color="#7141F8" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div>
        <SettingsLabel />
        <div className="p-4 lg:px-8 flex justify-center">
          <AccessDeniedPanel />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default SettingsOrganisationRouteGuard;
