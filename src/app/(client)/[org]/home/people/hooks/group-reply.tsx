import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import { prefetchAvatars } from "~/utils/prefetch-avatars";

const UseGroupReply = () => {
  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);
  const token = localStorage.getItem("token") || "";
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // get persisted chats data
  const fetchThreads = async (newPage: number = 1) => {
    try {
      const res = await GetRequest(
        `/group-dms/thread/${state?.thread?.thread_id}/channels/${id}?page=${newPage}&limit=30`
      );

      if (res?.status === 200 || res?.status === 201) {
        const newThreads = Array.isArray(res.data?.data) ? res.data?.data : [];

        // Get previous threads from state
        const prevThreads = state?.threads || [];

        dispatch({
          type: ACTIONS.REPLIES,
          payload: { newThreads: [...prevThreads, ...newThreads], newPage },
        });

        prefetchAvatars(newThreads);

        setHasMore([...prevThreads, ...newThreads].length > 30);
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
    if (id && token && state?.thread?.thread_id) {
      fetchThreads(1).finally(() =>
        dispatch({ type: ACTIONS.MESSAGE_LOADING, payload: false })
      );
    }
  }, [
    id,
    token,
    state?.callback,
    state?.thread?.thread_id,
    state?.notificationCallback,
    state?.triggerCallback,
  ]);

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

export default UseGroupReply;
