"use client";
import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { CheckIcon, X } from "lucide-react";
import { PostRequest, PutRequest } from "~/utils/new-request";
import {
  fetchOrganisationRoles,
  fetchSystemPermissionsCatalog,
} from "~/utils/org-access-api";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { showError, showSuccess } from "~/components/toast/sonner";
import Loading from "~/components/ui/loading";
import {
  ApiPermission,
  UiPermission,
  buildUiPermissions,
  formatPermissionCategory,
  toPermissionListPayload,
} from "~/utils/org-permissions";
import { cn } from "~/lib/utils";

interface StorageOffloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNew?: boolean;
  roleId?: string;
  roleName?: string;
  description?: string;
  permissions?: Record<string, boolean> | null;

  onRoleCreated?: (_role: any) => void;
}

const RoleModal: React.FC<StorageOffloadModalProps> = ({
  isOpen,
  onClose,
  isNew = false,
  roleId,
  roleName: initialRoleName,
  description: initialDescription,
  permissions: initialPermissions,
  onRoleCreated,
}) => {
  const [roleName, setRoleName] = useState<string>(initialRoleName || "");
  const [roleDescription, setRoleDescription] = useState<string>("");
  const [permissions, setPermissions] = useState<UiPermission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const permissionsCatalog = state.permissionsCatalog as ApiPermission[] | null;

  const applyPermissionsFromCatalog = useCallback(
    (catalog: ApiPermission[]) => {
      setPermissions(
        buildUiPermissions(catalog, isNew ? null : (initialPermissions ?? null))
      );
    },
    [isNew, initialPermissions]
  );

  const loadPermissionsCatalog = useCallback(async () => {
    if (permissionsCatalog?.length) {
      applyPermissionsFromCatalog(permissionsCatalog);
      return;
    }

    setPermissionsLoading(true);
    try {
      const catalog = await fetchSystemPermissionsCatalog();
      dispatch({ type: ACTIONS.PERMISSIONS_CATALOG, payload: catalog });
      applyPermissionsFromCatalog(catalog);
    } catch {
      showError("Failed to load permissions");
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  }, [permissionsCatalog, applyPermissionsFromCatalog, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    setRoleName(initialRoleName || "");
    setRoleDescription(initialDescription || "");
    loadPermissionsCatalog();
  }, [isOpen, initialRoleName, initialDescription, loadPermissionsCatalog]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, UiPermission[]>();
    for (const permission of permissions) {
      const category = permission.category || "general";
      const list = groups.get(category) ?? [];
      list.push(permission);
      groups.set(category, list);
    }

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const togglePermission = (permissionId: string) => {
    setPermissions((prev) =>
      prev.map((permission) => {
        if (permission.id !== permissionId || permission.locked) {
          return permission;
        }
        return { ...permission, enabled: !permission.enabled };
      })
    );
  };

  const refreshOrgRoles = useCallback(async () => {
    if (!state.orgId) return;
    try {
      const roles = await fetchOrganisationRoles(state.orgId);
      dispatch({ type: ACTIONS.ORG_ROLES, payload: roles });
    } catch {
      showError("Failed to refresh roles");
    }
  }, [dispatch, state.orgId]);

  const handleSaveChanges = async () => {
    if (!roleName.trim()) {
      showError("Role name is required");
      return;
    }

    setButtonLoading(true);
    const permission_list = toPermissionListPayload(permissions);

    if (isNew) {
      const response = await PostRequest(
        `/organisations/${state.orgId}/roles`,
        {
          name: roleName.trim(),
          description: roleDescription.trim(),
          permission_list,
        }
      );

      if (response?.status === 200 || response?.status === 201) {
        const newRole = response.data?.data || response.data;
        await refreshOrgRoles();
        showSuccess("Role created successfully");
        if (onRoleCreated) {
          onRoleCreated(newRole);
        }
        onClose();
      }
    } else {
      const response = await PutRequest(
        `/organisations/${state.orgId}/roles/${roleId}`,
        {
          name: roleName.trim(),
          description: roleDescription.trim(),
          permission_list,
        }
      );

      if (
        response?.status === 200 ||
        response?.status === 201 ||
        response?.data?.status === "success"
      ) {
        showSuccess(response?.data?.message || "Role updated successfully");
        await refreshOrgRoles();
        onClose();
      }
    }

    setButtonLoading(false);
  };

  const getCharacterCount = () => {
    return `${roleDescription.length}/36`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-sm bg-black/50">
        <DialogContent className="sm:max-w-2xl bg-white rounded-lg shadow-xl border-0 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {isNew ? "Create New Role" : "Update Role"}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-500" />
                </Button>
              </div>
            </DialogHeader>

            <div className="px-6 py-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Role Name
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Manager"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Role Description
                </label>
                <div className="relative">
                  <textarea
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    maxLength={36}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="e.g. Tier 2 - Second-in-command"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {getCharacterCount()}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Permissions
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Default permissions are always enabled for every role.
                  </p>
                </div>

                {permissionsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loading color="#7141F8" />
                  </div>
                ) : permissions.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">
                    No permissions available.
                  </p>
                ) : (
                  groupedPermissions.map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                        {formatPermissionCategory(category)}
                      </h4>
                      <div className="space-y-3 rounded-lg border border-[#E6EAEF] bg-[#F9FAFB] p-4">
                        {items.map((permission) => (
                          <div
                            key={permission.id}
                            className={cn(
                              "flex items-start gap-3",
                              permission.locked && "opacity-90"
                            )}
                          >
                            <div className="relative pt-0.5">
                              <input
                                type="checkbox"
                                id={permission.id}
                                checked={permission.enabled}
                                disabled={permission.locked}
                                onChange={() => togglePermission(permission.id)}
                                className="sr-only"
                              />
                              <label
                                htmlFor={permission.id}
                                className={cn(
                                  "flex items-center justify-center w-5 h-5 border rounded",
                                  permission.locked
                                    ? "cursor-not-allowed bg-[#F1F1FE] border-[#7141F8]"
                                    : "cursor-pointer bg-white",
                                  permission.enabled && !permission.locked
                                    ? "border-[#7141F8]"
                                    : !permission.locked && "border-gray-300"
                                )}
                              >
                                {permission.enabled && (
                                  <CheckIcon className="h-3 w-3 text-[#7141F8]" />
                                )}
                              </label>
                            </div>
                            <div className="min-w-0 flex-1">
                              <label
                                htmlFor={permission.id}
                                className={cn(
                                  "text-sm font-medium text-gray-900 block",
                                  !permission.locked && "cursor-pointer"
                                )}
                              >
                                {permission.name}
                                {permission.locked && (
                                  <span className="ml-2 text-[10px] font-semibold uppercase text-[#7141F8]">
                                    Default
                                  </span>
                                )}
                              </label>
                              {permission.description ? (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {permission.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 my-4" />
            <div className="text-sm text-gray-500 px-5">
              <span className="font-medium">Note:</span> This affects your
              team&apos;s access.
            </div>
            <div className="px-6 py-4 bg-white flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={buttonLoading || permissionsLoading}
                className="bg-[#7141F8] text-white rounded-md hover:bg-[#7141F8]/80 transition-colors"
              >
                {buttonLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export default RoleModal;
