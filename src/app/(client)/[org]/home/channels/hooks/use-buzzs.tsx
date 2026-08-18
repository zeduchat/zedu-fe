import { useCallback, useEffect, useState } from "react";
import type { BuzzsPagination, OrgBuzz } from "~/types/buzzs";
import { GetRequest } from "~/utils/new-request";

const UseBuzzs = () => {
  const [buzzes, setBuzzes] = useState<OrgBuzz[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const fetchBuzzes = useCallback(async (newPage = 1, append = false) => {
    setLoading(true);

    try {
      const res = await GetRequest(`/buzz/org/all?page=${newPage}&limit=20`);

      if (res?.status === 200 || res?.status === 201) {
        const incoming: OrgBuzz[] = res.data?.data?.buzzes ?? [];
        const pagination: BuzzsPagination | undefined =
          res.data?.data?.pagination;

        setBuzzes((prev) => (append ? [...prev, ...incoming] : incoming));
        setTotalItems(pagination?.total_items ?? incoming.length);

        if (pagination) {
          setHasMore(pagination.current_page < pagination.total_pages_count);
        } else {
          setHasMore(incoming.length >= 20);
        }

        setPage(newPage);
      } else {
        if (!append) setBuzzes([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching buzzes:", error);
      if (!append) setBuzzes([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuzzes(1, false);
  }, [fetchBuzzes]);

  const fetchMoreData = () => {
    if (hasMore && !loading) {
      fetchBuzzes(page + 1, true);
    }
  };

  const refresh = () => fetchBuzzes(1, false);

  return {
    buzzes,
    fetchMoreData,
    hasMore,
    loading,
    totalItems,
    refresh,
  };
};

export default UseBuzzs;
