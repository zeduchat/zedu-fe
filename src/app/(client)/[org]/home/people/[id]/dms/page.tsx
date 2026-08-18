"use client";
import { useContext, useEffect, useState } from "react";
import ChatDemo from "~/app/(client)/[org]/_components/buzz-management/ChatDemo";
// import ChatBuzzSidePanel from "~/app/(client)/[org]/_components/buzz-management/chatBuzzSidePanel";
import ChatHeader from "../../../../_components/chat-nav";
import GroupMessage from "~/app/(client)/[org]/_components/group-message";
import { GetRequest, PostRequest } from "~/utils/new-request";
import { DataContext } from "~/store/GlobalState";
import MessageBox from "~/app/(client)/[org]/_components/message-box";
import ChatConnection from "~/components/layout/centrifugo/chat-connection";
import ThreadsSidebar from "~/app/(client)/[org]/_components/threads-sidebar";
import UseGroupReply from "../../hooks/group-reply";
import { useParams } from "next/navigation";
import HoverSidebar from "~/app/(client)/[org]/_components/profile-sidebar/hover-sidebar";
import ChatAgoraConnection from "~/components/layout/centrifugo/chat-agora-connection";
import { ACTIONS } from "~/store/Actions";

const ChatPage = () => {
  const { state, dispatch } = useContext(DataContext);
  const { orgId, dmDetails, participants: previewParticipants, user } = state;
  const [participants, setParticipants] = useState<any>(null);
  const [fetchedChannelId, setFetchedChannelId] = useState<string | null>(null);
  const { fetchMoreData, hasMore } = UseGroupReply();
  const params = useParams();
  const id = params.id as string;

  // get the participant infor
  useEffect(() => {
    setParticipants(previewParticipants);
    const getUser = async () => {
      const res = await GetRequest(
        `/organisations/${orgId}/dms/participants/${id}`
      );
      if (res?.status === 200 || res?.status === 201) {
        setParticipants(res?.data?.data.participants);
        setFetchedChannelId(id);
      }
    };

    if (orgId) {
      getUser();
    }
  }, [id, orgId]);

  // send message
  const handleSendMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    const payload = {
      content: content,
      media: medias,
      mentions: state?.mentions,
    };
    await PostRequest(`/group-dms/channels/${id}/threads`, payload);
  };

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
      thread_id: state?.thread?.thread_id,
      media: medias,
      mentions: state?.mentions,
    };

    await PostRequest(`/group-dms/messages/${id}`, payload);
  };

  //

  let totalSidePanelWidth = 0;
  if (state?.hoverProfile) {
    totalSidePanelWidth += 408;
  }
  if (state?.reply) {
    totalSidePanelWidth += 440;
  }

  return (
    <div className="flex h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <ChatConnection />
      <div
        className="relative flex flex-col flex-1 transition-[margin] duration-300 ease-in-out"
        style={{ marginRight: `${totalSidePanelWidth}px` }}
      >
        <ChatHeader
          participants={
            previewParticipants?.length !== 0
              ? previewParticipants
              : participants
          }
        />
        <GroupMessage
          participants={
            previewParticipants?.length !== 0
              ? previewParticipants
              : participants
          }
        />
        <div className="absolute bottom-0 w-full">
          <MessageBox
            subscription={state?.chatSubscription}
            sendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* Master Side Panels Container - Holds all right-aligned panels */}
      <div
        className="fixed z-30 mt-[60px] right-0 top-0 h-full flex transition-all duration-300 ease-in-out"
        style={{ width: `${totalSidePanelWidth}px` }}
      >
        {/* Hover Sidebar */}
        {state?.hoverProfile && (
          <div className="w-[408px] h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_25px_0px_#DFDFDF]">
            <HoverSidebar />
          </div>
        )}

        {/* Threads Sidebar */}
        {state?.reply && (
          <div className="w-[440px] h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_27px_0px_#DFDFDF]">
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

export default ChatPage;
