import { GetRequest } from "~/utils/new-request";
import type { ApiPermission, OrgRoleRecord } from "~/utils/org-permissions";

export const isOrgAccessApiSuccess = (response: {
  status?: number;
  data?: { status?: string; status_code?: number; code?: number };
}) =>
  response?.status === 200 ||
  response?.status === 201 ||
  response?.data?.status === "success" ||
  response?.data?.status_code === 200 ||
  response?.data?.code === 200;

export const parsePermissionsCatalogResponse = (
  response: { data?: { data?: unknown } } | null | undefined
): ApiPermission[] => {
  if (!Array.isArray(response?.data?.data)) return [];
  return response.data.data as ApiPermission[];
};

export const parseOrganisationRolesResponse = (
  response: { data?: { data?: unknown } } | null | undefined
): OrgRoleRecord[] => {
  if (!Array.isArray(response?.data?.data)) return [];
  return response.data.data as OrgRoleRecord[];
};

export const fetchSystemPermissionsCatalog = async (): Promise<
  ApiPermission[]
> => {
  const response = await GetRequest("/permissions");
  if (!isOrgAccessApiSuccess(response)) {
    throw new Error("Failed to fetch permissions catalog");
  }
  return parsePermissionsCatalogResponse(response);
};

export const fetchOrganisationRoles = async (
  orgId: string
): Promise<OrgRoleRecord[]> => {
  const response = await GetRequest(`/organisations/${orgId}/roles`);
  if (!isOrgAccessApiSuccess(response)) {
    throw new Error("Failed to fetch organisation roles");
  }
  return parseOrganisationRolesResponse(response);
};

export const bootstrapOrganisationAccess = async (orgId: string) => {
  const [permissions, roles] = await Promise.all([
    fetchSystemPermissionsCatalog(),
    fetchOrganisationRoles(orgId),
  ]);
  return { permissions, roles };
};
