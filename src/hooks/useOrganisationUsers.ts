import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest } from "~/utils/new-request";

type OrgUsersPagination = {
  loadedPage: number;
  hasMore: boolean;
};

const paginationByOrgId = new Map<string, OrgUsersPagination>();

const getOrgPagination = (orgId: string): OrgUsersPagination => {
  if (!paginationByOrgId.has(orgId)) {
    paginationByOrgId.set(orgId, { loadedPage: 0, hasMore: true });
  }
  return paginationByOrgId.get(orgId)!;
};

const memberKey = (member: {
  id?: string | number;
  user_id?: string | number;
}) => String(member.id ?? member.user_id ?? "");

const mergeOrgMembers = (existing: unknown[], incoming: unknown[]) => {
  const seen = new Set<string>();
  const merged: unknown[] = [];

  for (const member of [...existing, ...incoming]) {
    const key = memberKey(
      member as { id?: string | number; user_id?: string | number }
    );
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(member);
  }

  return merged;
};

type UseOrganisationUsersOptions = {
  /** When false, skips automatic fetch (e.g. modal closed). Default true. */
  enabled?: boolean;
};

export const useOrganisationUsers = (
  orgId: string,
  options?: UseOrganisationUsersOptions
) => {
  const enabled = options?.enabled !== false;
  const { state, dispatch } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const orgMembersRef = useRef(state.orgMembers);

  useEffect(() => {
    orgMembersRef.current = state.orgMembers;
  }, [state.orgMembers]);

  const fetchUsers = useCallback(
    async (pageNumber: number, isInitial: boolean) => {
      if (!orgId) return;

      setLoading(true);
      const response = await GetRequest(
        `/organisations/${orgId}/users?page=${pageNumber}&limit=50`
      );

      if (response?.status === 200 || response?.status === 201) {
        const newUsers = response?.data?.data || [];
        const pagination = response?.data?.pagination?.[0];
        const orgPagination = getOrgPagination(orgId);

        orgPagination.loadedPage = Math.max(
          orgPagination.loadedPage,
          pageNumber
        );
        orgPagination.hasMore = pagination
          ? pagination.current_page < pagination.total_pages
          : false;
        setHasMore(orgPagination.hasMore);

        const base = isInitial ? [] : orgMembersRef.current || [];
        dispatch({
          type: ACTIONS.ORG_MEMBERS,
          payload: mergeOrgMembers(base, newUsers),
        });
      }
      setLoading(false);
    },
    [orgId, dispatch]
  );

  useEffect(() => {
    if (!enabled || !orgId) return;

    const orgPagination = getOrgPagination(orgId);
    setHasMore(orgPagination.hasMore);

    const memberCount = state.orgMembers?.length ?? 0;
    const hasCachedMembers = memberCount > 0;

    if (orgPagination.loadedPage === 0 && hasCachedMembers) {
      orgPagination.loadedPage = 1;
      if (memberCount < 50) {
        orgPagination.hasMore = false;
        setHasMore(false);
      }
    }

    if (orgPagination.loadedPage === 0 && !hasCachedMembers) {
      fetchUsers(1, true);
    }
  }, [orgId, enabled, fetchUsers, state.orgMembers?.length]);

  const loadMore = useCallback(() => {
    if (!orgId || loading) return;

    const orgPagination = getOrgPagination(orgId);
    if (!orgPagination.hasMore) return;

    const nextPage = orgPagination.loadedPage + 1;
    fetchUsers(nextPage, false);
  }, [orgId, loading, fetchUsers]);

  return { loading, hasMore, loadMore };
};
