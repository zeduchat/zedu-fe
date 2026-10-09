import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import {
  ORGANISATION_THREADS_PAGE_LIMIT,
  loadOrganisationThreadsPage,
} from "~/utils/org-threads";
import type { ThreadGroup } from "~/types/threads";

function threadGroupId(group: ThreadGroup) {
  return group.thread_id || group.thread_messages?.[0]?.thread_id || "";
}

const UseThreads = () => {
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const { state, dispatch } = useContext(DataContext);
  const { threadMentions } = state;

  const initialLoading =
    threadMentions === null || threadMentions === undefined;
  const loading = initialLoading || loadingMore;

  hasMoreRef.current = hasMore;

  useEffect(() => {
    if (threadMentions !== null && threadMentions !== undefined) return;

    const orgId = localStorage.getItem("orgId") || "";
    if (!orgId || !state?.token) return;

    const loadInitial = async () => {
      const {
        success,
        threads,
        hasMore: nextHasMore,
        unseenThreadCount,
      } = await loadOrganisationThreadsPage(orgId, 1);

      dispatch({
        type: ACTIONS.THREAD_MENTIONS,
        payload: {
          newThreads: success ? threads : [],
          newPage: 1,
          hasMore: nextHasMore,
          unseenThreadCount: success ? unseenThreadCount : 0,
        },
      });
      pageRef.current = 1;
      setHasMore(nextHasMore);
    };

    void loadInitial();
  }, [threadMentions, state?.token, dispatch]);

  useEffect(() => {
    if (!Array.isArray(threadMentions)) return;
    if (
      threadMentions.length === 0 ||
      threadMentions.length % ORGANISATION_THREADS_PAGE_LIMIT !== 0
    ) {
      setHasMore(false);
    }
  }, [threadMentions]);

  const fetchThreads = useCallback(
    async (newPage: number) => {
      const orgId = localStorage.getItem("orgId") || "";

      if (!orgId) {
        setHasMore(false);
        return;
      }

      if (newPage <= pageRef.current || loadingMoreRef.current) {
        return;
      }

      const previousPage = pageRef.current;
      pageRef.current = newPage;
      loadingMoreRef.current = true;
      setLoadingMore(true);

      try {
        const {
          success,
          threads,
          hasMore: nextHasMore,
        } = await loadOrganisationThreadsPage(orgId, newPage);

        if (!success) {
          pageRef.current = previousPage;
          setHasMore(false);
          return;
        }

        const existing = new Set(
          (Array.isArray(threadMentions) ? threadMentions : []).map(
            threadGroupId
          )
        );
        const added = threads.filter((group) => {
          const id = threadGroupId(group);
          return id && !existing.has(id);
        });

        if (added.length === 0) {
          pageRef.current = previousPage;
          setHasMore(false);
          return;
        }

        dispatch({
          type: ACTIONS.THREAD_MENTIONS,
          payload: {
            newThreads: threads,
            newPage,
            hasMore: nextHasMore,
          },
        });
        setHasMore(nextHasMore);
      } finally {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    },
    [dispatch, threadMentions]
  );

  const fetchMoreData = useCallback(() => {
    if (!hasMoreRef.current || loadingMoreRef.current) return;
    void fetchThreads(pageRef.current + 1);
  }, [fetchThreads]);

  return {
    fetchMoreData,
    hasMore,
    loading,
  };
};

export default UseThreads;
