import { useContext, useEffect, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { loadOrganisationThreadsPage } from "~/utils/org-threads";

const UseThreads = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const {
    threadMentions,
    countCallback,
    loadThread,
    threadMentionsHasMore,
    reply,
  } = state;

  const initialLoading =
    threadMentions === null || threadMentions === undefined;
  const loading = initialLoading || loadingMore;

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
    };

    void loadInitial();
  }, [threadMentions, state?.token, dispatch, state?.loadThread]);

  useEffect(() => {
    if (!Array.isArray(threadMentions)) return;
    setPage(1);
    setHasMore(
      typeof threadMentionsHasMore === "boolean"
        ? threadMentionsHasMore
        : threadMentions.length >= 50
    );
  }, [threadMentions, countCallback, loadThread, threadMentionsHasMore]);

  const fetchThreads = async (newPage: number) => {
    const orgId = localStorage.getItem("orgId") || "";

    if (!orgId) {
      setHasMore(false);
      return;
    }

    if (newPage === 1) {
      return;
    }

    setLoadingMore(true);

    try {
      const {
        success,
        threads,
        hasMore: nextHasMore,
      } = await loadOrganisationThreadsPage(orgId, newPage);

      if (success) {
        dispatch({
          type: ACTIONS.THREAD_MENTIONS,
          payload: { newThreads: threads, newPage },
        });
        setHasMore(nextHasMore);
        setPage(newPage);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchMoreData = () => {
    if (hasMore && !loading) {
      void fetchThreads(page + 1);
    }
  };

  return {
    fetchMoreData,
    hasMore,
    loading,
  };
};

export default UseThreads;
