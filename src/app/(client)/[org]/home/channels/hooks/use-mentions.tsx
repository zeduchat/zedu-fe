import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { loadOrganisationThreadsPage } from "~/utils/org-threads";

const UseMentions = () => {
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);
  const token = localStorage.getItem("token") || "";

  const fetchThreads = async (newPage: number = 1) => {
    const orgId = localStorage.getItem("orgId") || "";
    try {
      const {
        success,
        threads,
        hasMore: nextHasMore,
        unseenThreadCount,
      } = await loadOrganisationThreadsPage(orgId, newPage);

      if (success) {
        dispatch({
          type: ACTIONS.THREAD_MENTIONS,
          payload: {
            newThreads: threads,
            newPage,
            hasMore: nextHasMore,
            ...(newPage === 1 ? { unseenThreadCount } : {}),
          },
        });

        setHasMore(nextHasMore);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching threads:", error);
      setHasMore(false);
    } finally {
      setPage(newPage);
    }
  };

  useEffect(() => {
    if (token) {
      fetchThreads(1).finally(() =>
        dispatch({ type: ACTIONS.MESSAGE_LOADING, payload: false })
      );
    }
  }, [id, token, dispatch, state?.countCallback]);

  const fetchMoreData = () => {
    if (hasMore) {
      const nextPage = page + 1;
      fetchThreads(nextPage);
    }
  };

  return {
    fetchMoreData,
    hasMore,
    loading,
  };
};

export default UseMentions;
