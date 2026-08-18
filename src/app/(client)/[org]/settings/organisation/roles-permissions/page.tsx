"use client";
import React, { useContext, useMemo } from "react";
import SettingsLabel from "../../components/settings-label";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import RoleSettings from "../../../_components/role-and-permissons/role-settings";
import RoleModal from "../../../_components/role-and-permissons/role-modal";
import { DataContext } from "~/store/GlobalState";
import { useRBAC } from "~/hooks/useRBAC";
import {
  buildPermissionNameMap,
  formatRoleDisplayName,
  normalizeRolePermissionList,
  permissionListToActionLabels,
  resolveCurrentUserOrgRole,
} from "~/utils/org-permissions";
import { useSettingsRolesLoading } from "../../context/settings-roles-loading-context";
import Loading from "~/components/ui/loading";
import { isOwnerOrAdministrator } from "~/utils/rbac";

const RolesPermissionsSkeleton = () => (
  <div className="flex flex-col gap-5 animate-pulse">
    <div className="rounded-lg border border-[#E6EAEF] bg-[#F9F7FF] p-5 space-y-3">
      <div className="h-3 w-48 bg-gray-200 rounded" />
      <div className="h-6 w-28 bg-gray-200 rounded-full" />
      <div className="h-4 w-full max-w-md bg-gray-200 rounded" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-24 bg-gray-200 rounded" />
        <div className="h-6 w-32 bg-gray-200 rounded" />
      </div>
    </div>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-lg border border-[#E6EAEF] bg-white p-4 space-y-4"
      >
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-6 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const Page = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { rolesLoading, permissionsLoading } = useSettingsRolesLoading();
  const accessLoading = rolesLoading || permissionsLoading;

  const { state } = useContext(DataContext);
  const { orgRoles, orgData, orgMembers, user, permissionsCatalog } = state;

  const permissionNameMap = useMemo(
    () => buildPermissionNameMap(permissionsCatalog),
    [permissionsCatalog]
  );
  const { userRole } = useRBAC();

  const currentUserRole = useMemo(
    () =>
      resolveCurrentUserOrgRole({
        user,
        orgData,
        orgMembers,
        orgRoles,
        fallbackRoleName: userRole,
      }),
    [user, orgData, orgMembers, orgRoles, userRole]
  );

  const yourRoleActions = useMemo(
    () => permissionListToActionLabels(currentUserRole.permissionList),
    [currentUserRole.permissionList]
  );

  const getPermissionActions = (permissions: Record<string, boolean>) =>
    permissionListToActionLabels(
      normalizeRolePermissionList(permissions),
      permissionNameMap
    );

  const isUsersRole = (role: { id: string; name: string }) => {
    if (currentUserRole.roleId && role.id === currentUserRole.roleId) {
      return true;
    }
    if (
      currentUserRole.roleName &&
      role.name?.toLowerCase() === currentUserRole.roleName.toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  const canManageRolesUi = isOwnerOrAdministrator(
    currentUserRole.roleName || userRole
  );

  return (
    <div className="w-full">
      <SettingsLabel />
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isNew={true}
      />

      <div className="p-4 lg:px-8 w-full">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
          <div className="w-full sm:w-auto">
            <h1 className="text-base font-semibold">Your Team Access</h1>
            <p className="text-sm text-[#344054] max-w-[500px]">
              Manage who can access what. Create roles or update permissions to
              stay in control.
            </p>
          </div>
          {canManageRolesUi ? (
            <Button
              className="w-full sm:w-auto px-4 py-2 bg-[#7141F8] text-white rounded-md hover:bg-[#7141F8]/80 transition-colors"
              onClick={() => setIsModalOpen(true)}
              disabled={accessLoading}
            >
              New Role
            </Button>
          ) : null}
        </div>

        {accessLoading ? (
          <div className="space-y-6">
            <div className="flex justify-center py-8">
              <Loading color="#7141F8" />
            </div>
            <RolesPermissionsSkeleton />
          </div>
        ) : (
          <>
            {currentUserRole.roleName ? (
              <Card className="mb-6 border-[#E6EAEF] bg-[#F9F7FF]">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
                      Your role in this organisation
                    </p>
                    <Badge className="bg-[#7141F8] text-white hover:bg-[#7141F8]">
                      {formatRoleDisplayName(currentUserRole.roleName)}
                    </Badge>
                  </div>
                  {currentUserRole.roleDescription ? (
                    <p className="text-sm text-[#344054]">
                      {currentUserRole.roleDescription}
                    </p>
                  ) : (
                    <p className="text-sm text-[#667085]">
                      Permissions for your assigned role in{" "}
                      {orgData?.name ? orgData.name : "this organisation"}.
                    </p>
                  )}
                  {yourRoleActions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {yourRoleActions.map((action, index) => (
                        <Badge
                          key={`${action.label}-${index}`}
                          className="text-sm text-gray-700 border border-[#E6EAEF] bg-white w-fit rounded-sm"
                        >
                          {action.label}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            <div className="flex flex-col gap-5">
              {orgRoles?.length ? (
                orgRoles.map((role: any) => (
                  <RoleSettings
                    key={role.id}
                    roleName={role.name}
                    description={role.description}
                    actions={getPermissionActions(
                      role.permissions?.permission_list ?? {}
                    )}
                    permissions={normalizeRolePermissionList(
                      role.permissions?.permission_list
                    )}
                    id={role.id}
                    isCurrentUserRole={isUsersRole(role)}
                    canEdit={canManageRolesUi}
                  />
                ))
              ) : (
                <p className="text-sm text-[#667085] py-8 text-center">
                  No roles found for this organisation.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
