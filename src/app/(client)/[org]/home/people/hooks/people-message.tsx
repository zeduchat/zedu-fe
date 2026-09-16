import { useParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import { prefetchAvatars } from "~/utils/prefetch-avatars";

const UsePeopleMessage = () => {
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

  useEffect(() => {
    if (!id || !token) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await GetRequest(
          `/dms/channels/${id}/threads?page=1&limit=50`
        );

        if (cancelled) return;

        if (res?.status === 200 || res?.status === 201) {
          const newThreads = Array.isArray(res.data?.data)
            ? res.data?.data
            : [];

          dispatch({
            type: ACTIONS.CHATS,
            payload: { newThreads, newPage: 1 },
          });

          prefetchAvatars(newThreads);
          setHasMore(newThreads.length >= 50);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching threads:", error);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          setPage(1);
          setLoading(false);
          dispatch({ type: ACTIONS.MESSAGE_LOADING, payload: false });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id, token, dispatch, state?.triggerCallback]);

  const fetchThreads = async (newPage: number) => {
    const requestId = id;
    try {
      const res = await GetRequest(
        `/dms/channels/${requestId}/threads?page=${newPage}&limit=50`
      );

      if (idRef.current !== requestId) return;

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
          setHasMore(newThreads.length >= 50);
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

  const fetchMoreData = () => {
    if (hasMore) {
      fetchThreads(page + 1);
    }
  };

  return {
    fetchMoreData,
    hasMore,
    loading,
  };
};

export default UsePeopleMessage;
