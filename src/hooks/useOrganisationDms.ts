import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest } from "~/utils/new-request";

const LIMIT = 50;

export const useOrganisationDms = (orgId: string) => {
  const { state, dispatch } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // Keep a ref so appends always use the latest list (avoids stale closure).
  const dmsRef = useRef(state.dms);
  dmsRef.current = state.dms;

  const fetchDms = useCallback(
    async (pageNumber: number, isInitial: boolean) => {
      if (!orgId) return;

      setLoading(true);
      const response = await GetRequest(
        `/organisations/${orgId}/dms?page=${pageNumber}&limit=${LIMIT}`
      );

      if (response?.status === 200 || response?.status === 201) {
        const newDms = response?.data?.data || [];
        const pagination = response?.data?.pagination?.[0];

        dispatch({
          type: ACTIONS.DMS,
          payload: isInitial ? newDms : [...(dmsRef.current || []), ...newDms],
        });

        setHasMore(
          pagination
            ? pagination.current_page < pagination.total_pages
            : newDms.length >= LIMIT
        );
      }
      setLoading(false);
    },
    [orgId, dispatch]
  );

  useEffect(() => {
    if (!orgId) return;
    setPage(1);
    setHasMore(true);
    fetchDms(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orgId,
    state?.groupCallback,
    state?.dmCount,
    state?.dmRenderCallback,
    state?.deleteCallback,
  ]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDms(nextPage, false);
    }
  }, [loading, hasMore, page, fetchDms]);

  return { loading, hasMore, loadMore };
};
