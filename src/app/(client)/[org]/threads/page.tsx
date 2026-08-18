"use client";

import { useContext } from "react";
import { ThreadList } from "../_components/threads/thread-lists";
import ThreadsSidebar from "../_components/threads-sidebar";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";
import UseThreadReply from "../home/channels/hooks/use-thread-reply";
import HoverSidebar from "../_components/profile-sidebar/hover-sidebar";
import { ACTIONS } from "~/store/Actions";

const Threads = () => {
  const { state, dispatch } = useContext(DataContext);
  const { thread, loadThread } = state;
  const { fetchMoreData, hasMore } = UseThreadReply();

  const handleReplyMessage = async (
    id: string,
    _uuid: string,
    content: string,
    medias: unknown
  ) => {
    const channelId = state?.thread?.channels_id || id;
    const payload = {
      content,
      channels_id: channelId,
      user_id: state?.user?.id,
      thread_id: state?.thread?.thread_id,
      media: medias,
      mentions: state?.mentions,
    };

    if (thread?.channel_type === "DM") {
      await PostRequest(`/dms/messages/${channelId}`, payload);
    } else if (thread?.channel_type === "GroupDm") {
      await PostRequest(`/group-dms/messages/${channelId}`, payload);
    } else {
      await PostRequest(`/channels/${channelId}/messages`, payload);
    }
    dispatch({ type: ACTIONS.LOAD_THREAD, payload: !loadThread });
  };

  let sidePanelWidth = 0;
  if (state?.hoverProfile) sidePanelWidth += 408;
  if (state?.reply) sidePanelWidth += 440;

  return (
    <div className="relative flex h-[calc(100dvh-70px)] w-full overflow-hidden">
      <div
        className="relative flex flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-in-out"
        style={{ marginRight: `${sidePanelWidth}px` }}
      >
        <ThreadList />
      </div>

      <div
        className="fixed right-0 top-0 mt-[60px] flex h-full transition-all duration-300 ease-in-out"
        style={{ width: `${sidePanelWidth}px` }}
      >
        {state?.hoverProfile && (
          <div className="h-full w-[408px] border-l border-[#E6EAEF] bg-white">
            <HoverSidebar />
          </div>
        )}

        {state?.reply && (
          <div className="h-full w-[440px] border-l border-[#E6EAEF] bg-white">
            <ThreadsSidebar
              handleSendMessage={handleReplyMessage}
              fetchMoreData={fetchMoreData}
              hasMore={hasMore}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Threads;
