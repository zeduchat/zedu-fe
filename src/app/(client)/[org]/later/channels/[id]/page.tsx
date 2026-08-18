"use client";

import React, { useContext, useState } from "react";

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
import UseChannelReply from "../../../home/channels/hooks/channel-reply";
import UseGetSingleChannel from "../../../home/channels/hooks/get-single-channel";

const ChannelsPage = () => {
  const { state, dispatch } = useContext(DataContext);
  const { fetchMoreData, hasMore } = UseChannelReply();

  const [showBuzzPanel, setShowBuzzPanel] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSendMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    const payload = {
      content: content,
      thread_id: uuid,
      media: medias,
      mentions: state?.mentions,
    };

    await PostRequest(`/threads/${id}`, payload);
  };

  const handleReplyMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
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
  if (showBuzzPanel) {
    totalSidePanelWidth += 440; // BuzzSidePanel width
  }
  if (isChatOpen) {
    totalSidePanelWidth += 305; // ChatDemo width
  }
  // Add other fixed sidebars if they are also open
  if (state?.hoverProfile) {
    totalSidePanelWidth += 408; // HoverSidebar width
  }
  if (state?.reply) {
    totalSidePanelWidth += 440; // ThreadsSidebar width
  }

  return (
    <div className="flex h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <ChannelConnection />
      <UseGetSingleChannel />

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
