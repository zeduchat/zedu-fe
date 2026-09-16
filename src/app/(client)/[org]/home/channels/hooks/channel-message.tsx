import { useParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import { prefetchAvatars } from "~/utils/prefetch-avatars";

const UseChannel = () => {
  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);
  const token = localStorage.getItem("token") || "";
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(id);
  const idRef = useRef(id);
  idRef.current = id;

  if (id !== activeId) {
    setActiveId(id);
    setLoading(true);
    setHasMore(true);
    setPage(1);
  }

  const fetchThreads = async (newPage: number = 1) => {
    const requestId = id;
    try {
      const res = await GetRequest(
        `/threads/channels/${requestId}?page=${newPage}&limit=80`
      );

      if (idRef.current !== requestId) return;

      if (res?.status === 200 || res?.status === 201) {
        const newThreads = Array.isArray(res.data?.data) ? res.data?.data : [];

        dispatch({
          type: ACTIONS.MESSAGES,
          payload: { newThreads, newPage },
        });

        prefetchAvatars(newThreads);

        // Set hasMore true only if messages exceed 80 and user scrolls
        if (newPage > 1 && newThreads.length > 0) {
          setHasMore(true);
        } else {
          setHasMore(newThreads.length >= 80);
        }
      }
      setLoading(false);
    } catch (error) {
      if (idRef.current !== requestId) return;
      console.error("Error fetching threads:", error);
      setHasMore(false);
    } finally {
      if (idRef.current === requestId) {
        setPage(newPage);
      }
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchThreads(1).finally(() => {
        if (idRef.current === id) {
          dispatch({ type: ACTIONS.MESSAGE_LOADING, payload: false });
        }
      });
    }
  }, [id, token, dispatch, state?.countCallback, state?.triggerCallback]);

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

export default UseChannel;
