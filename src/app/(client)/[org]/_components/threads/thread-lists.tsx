"use client";

import { useContext, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { MessageSquare } from "lucide-react";
import { ThreadItem } from "./thread-item";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import UseThreads from "../../home/channels/hooks/use-threads";
import type { ThreadGroup } from "~/types/threads";
import { GetRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";

export const ThreadList = () => {
  const { state, dispatch } = useContext(DataContext);
  const { threadMentions } = state;
  const { fetchMoreData, hasMore, loading } = UseThreads();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orgId = localStorage.getItem("orgId") || "";

    const loadSavedChats = async () => {
      const res = await GetRequest(`/organisations/${orgId}/saved/message`);

      if (res?.status === 200 || res?.status === 201) {
        const result = res?.data?.data?.map(
          (item: { type: string; id: string; thread_id?: string }) =>
            item.type === "thread"
              ? { id: item.id, thread_id: item.thread_id }
              : { id: item.id }
        );

        dispatch({ type: ACTIONS.BOOKMARKS, payload: result });
      }
    };

    if (orgId) {
      void loadSavedChats();
    }
  }, [dispatch]);

  const threadGroups: ThreadGroup[] = threadMentions || [];
  const totalThreads = threadGroups.length;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6EAEF] shrink-0">
        <h1 className="text-[22px] font-bold text-[#1D2939]">Threads</h1>
        {!loading && totalThreads > 0 && (
          <span className="text-sm text-[#667085]">
            {totalThreads} thread{totalThreads === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div
        id="threadsScrollable"
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        {loading && threadGroups.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loading color="#1264A3" />
            <p className="text-sm text-[#667085]">Loading threads...</p>
          </div>
        ) : threadGroups.length > 0 ? (
          <InfiniteScroll
            dataLength={threadGroups.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              <p className="py-6 text-xs text-center text-[#667085]">
                Loading more threads...
              </p>
            }
            scrollableTarget="threadsScrollable"
          >
            {threadGroups.map((group, index) => (
              <ThreadItem
                key={group.thread_id ?? `${group.channel_name}-${index}`}
                group={group}
              />
            ))}
          </InfiniteScroll>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#F2F4F7]">
              <MessageSquare
                className="size-8 text-[#98A2B3]"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="mb-2 text-lg font-bold text-[#344054]">
              No threads yet
            </h2>
            <p className="max-w-sm text-sm text-[#667085]">
              Threads you&apos;re involved in will show up here. Reply to a
              message in a channel to start a thread.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
