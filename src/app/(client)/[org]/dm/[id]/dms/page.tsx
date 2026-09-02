"use client";
import React, { useContext, useEffect, useState } from "react";
import { GetRequest, PostRequest } from "~/utils/new-request";
import { DataContext } from "~/store/GlobalState";
import MessageBox from "~/app/(client)/[org]/_components/message-box";
import ChatConnection from "~/components/layout/centrifugo/chat-connection";
import ThreadsSidebar from "~/app/(client)/[org]/_components/threads-sidebar";
import { useParams } from "next/navigation";
import HoverSidebar from "~/app/(client)/[org]/_components/profile-sidebar/hover-sidebar";
import UseGroupReply from "../../../home/people/hooks/group-reply";
import ChatHeader from "../../../_components/chat-nav";
import GroupMessage from "../../../_components/group-message";
import { ACTIONS } from "~/store/Actions";

const DmPage = () => {
  const { state, dispatch } = useContext(DataContext);
  const { orgId, participants: previewParticipants, user } = state;
  const [participants, setParticipants] = useState<any>(null);
  const { fetchMoreData, hasMore } = UseGroupReply();
  const params = useParams();
  const id = params.id as string;

  // Keep local header state in sync when membership changes in global state.
  useEffect(() => {
    setParticipants(previewParticipants);
  }, [previewParticipants]);

  // get the participant infor
  useEffect(() => {
    if (!orgId || !id) return;

    let cancelled = false;

    const getUser = async () => {
      const res = await GetRequest(
        `/organisations/${orgId}/dms/participants/${id}`
      );
      if (cancelled) return;
      if (res?.status === 200 || res?.status === 201) {
        const list = res?.data?.data.participants ?? [];
        setParticipants(list);
        dispatch({ type: ACTIONS.PARTICIPANTS, payload: list });
      }
    };

    void getUser();

    return () => {
      cancelled = true;
    };
  }, [id, orgId, dispatch]);

  // send message
  const handleSendMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
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
      user_id: user?.user_id ?? user?.id,
      reactions: null,
      isOptimistic: true,
    };

    dispatch({
      type: ACTIONS.CHATS,
      payload: { newMessage: optimisticMessage },
    });

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

  return (
    <div className="flex h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <ChatConnection />
      <div
        className={`relative flex flex-col flex-1 ${state?.reply ? "mr-[440px]" : ""}`}
      >
        <ChatHeader participants={participants} />
        <GroupMessage participants={participants} />

        <div className="absolute bottom-0 w-full">
          <MessageBox
            subscription={state?.chatSubscription}
            sendMessage={handleSendMessage}
          />
        </div>
      </div>

      <div
        className={`fixed mt-[60px] right-0 top-0 z-20 w-full sm:w-[408px] h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_25px_0px_#DFDFDF] ${state?.hoverProfile ? "translate-x-0" : "translate-x-full"}`}
      >
        <HoverSidebar />
      </div>

      <div
        className={`fixed mt-[60px] right-0 top-0 z-20 w-full sm:w-[440px] h-full bg-white border-l border-[#E6EAEF] transition-transform duration-300 ease-in-out ${state?.reply ? "translate-x-0" : "translate-x-full"}`}
      >
        <ThreadsSidebar
          handleSendMessage={handleReplyMessage}
          fetchMoreData={fetchMoreData}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
};

export default DmPage;
