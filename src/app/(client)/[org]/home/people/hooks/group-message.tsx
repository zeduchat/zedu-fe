import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import { prefetchAvatars } from "~/utils/prefetch-avatars";

const UseGroupMessage = () => {
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
        `/group-dms/channels/${id}/threads?page=${newPage}&limit=30`
      );

      if (res?.status === 200 || res?.status === 201) {
        const newThreads = Array.isArray(res.data?.data) ? res.data?.data : [];

        dispatch({
          type: ACTIONS.CHATS,
          payload: { newThreads, newPage },
        });

        prefetchAvatars(newThreads);

        if (newPage > 1 && newThreads.length > 0) {
          setHasMore(true);
        } else {
          setHasMore(newThreads.length >= 30);
        }
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
    if (id && token) {
      fetchThreads(1).finally(() =>
        dispatch({ type: ACTIONS.MESSAGE_LOADING, payload: false })
      );
    }
  }, [id, token, state?.replies, state?.triggerCallback]);

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

export default UseGroupMessage;
