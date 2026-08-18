"use client";

import { useContext, useEffect, useState } from "react";

import ArchivedChannel from "../../../_components/archived-channel";
import ChannelConnection from "~/components/layout/centrifugo/channel-connection";
import ChannelHeader from "../../../_components/channel-nav";
import ChannelsMessage from "../../../_components/ChannelMessage";
import { DataContext } from "~/store/GlobalState";
import HoverSidebar from "../../../_components/profile-sidebar/hover-sidebar";
import JoinChannel from "../../../_components/join-channel";
import MessageBox from "../../../_components/message-box";
import { PostRequest } from "~/utils/new-request";
import ThreadsSidebar from "../../../_components/threads-sidebar";
import UseChannelReply from "../hooks/channel-reply";
import UseGetSingleChannel from "../hooks/get-single-channel";
import { useParams } from "next/navigation";
import ChannelAgoraConnection from "~/components/layout/centrifugo/channel-agora-connection";
import { ACTIONS } from "~/store/Actions";

const ChannelsPage = () => {
  const params = useParams();
  const channelId = params?.id;

  const { state, dispatch } = useContext(DataContext);
  const { buzzSidebar, buzzView, user } = state;
  const { fetchMoreData, hasMore } = UseChannelReply();
  const shouldShowBuzzSidePanel =
    buzzSidebar && (buzzView === "side" || buzzView === "full");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (!buzzSidebar && isChatOpen) {
      setIsChatOpen(false);
    }
  }, [buzzSidebar, isChatOpen]);

  useEffect(() => {
    const updateDesktopState = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateDesktopState();
    window.addEventListener("resize", updateDesktopState);

    return () => window.removeEventListener("resize", updateDesktopState);
  }, []);

  // send messages
  const handleSendMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    // send client side update
    const optimisticMessage = {
      channels_id: id,
      thread_id: uuid,
      username: user?.username || "You",
      avatar_url: user?.avatar_url,
      message: content,
      created_at: new Date().toISOString(),
      status: "pending",
      type: "message",
      media: state.media,
      user_id: user?.user_id,
      reactions: null,
      isOptimistic: true,
    };

    dispatch({
      type: ACTIONS.MESSAGES,
      payload: { newMessage: optimisticMessage },
    });

    const payload = {
      content: content,
      thread_id: uuid,
      media: medias,
      mentions: state?.mentions,
    };

    await PostRequest(`/threads/${id}`, payload);
  };

  // reply messages
  const handleReplyMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    const optimisticMessage = {
      id: uuid,
      channels_id: id,
      thread_id: state?.thread?.thread_id,
      username: user?.username || "You",
      avatar_url: user?.avatar_url,
      message: content,
      created_at: new Date().toISOString(),
      status: "pending",
      type: "message",
      media: state.media,
      user_id: user?.user_id ?? user?.id,
      reactions: null,
      isOptimistic: true,
    };

    dispatch({
      type: ACTIONS.REPLIES,
      payload: { newMessage: optimisticMessage },
    });

    const payload = {
      content: content,
      channels_id: id,
      user_id: state?.user?.id,
      thread_id: state?.thread?.thread_id,
      media: medias,
      mentions: state?.mentions,
    };

    await PostRequest(`/channels/${id}/messages`, payload);
  };

  if (state?.channelloading) return null;

  // Calculate combined width of open side panels
  let totalSidePanelWidth = 0;

  const buzzRegionWidth = shouldShowBuzzSidePanel
    ? isDesktop && isChatOpen
      ? 820
      : 440
    : 0;
  totalSidePanelWidth += buzzRegionWidth;

  if (state?.hoverProfile) {
    totalSidePanelWidth += 408;
  }
  if (state?.reply) {
    totalSidePanelWidth += 440;
  }

  return (
    <div className="flex h-[calc(100dvh-70px)] relative w-full overflow-hidden">
      <UseGetSingleChannel />
      <ChannelConnection />
      <ChannelAgoraConnection />

      {/* MAIN CONTENT */}
      <div
        className="relative flex flex-col flex-1 transition-[margin] duration-300 ease-in-out"
        style={{ marginRight: `${totalSidePanelWidth}px` }}
      >
        <ChannelHeader />

        <ChannelsMessage />

        <div className="absolute bottom-0 w-full">
          {!state?.channelloading && state?.channelDetails?.access === false ? (
            <JoinChannel />
          ) : state?.channelDetails?.archived ? (
            <ArchivedChannel />
          ) : (
            <MessageBox
              subscription={state?.channelSubscription}
              sendMessage={handleSendMessage}
            />
          )}
        </div>
      </div>

      {/* Master Side Panels Container - Holds all right-aligned panels */}
      <div
        className="fixed z-30 mt-[60px] right-0 top-0 h-full flex transition-all duration-300 ease-in-out"
        style={{ width: `${totalSidePanelWidth}px` }}
      >
        {/* Hover Sidebar */}
        {state?.hoverProfile && (
          <div className="w-[408px] h-full bg-white border-l border-[#E6EAEF]">
            <HoverSidebar />
          </div>
        )}

        {/* Threads Sidebar */}
        {state?.reply && (
          <div className="w-[440px] h-full bg-white border-l border-[#E6EAEF]">
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

export default ChannelsPage;
