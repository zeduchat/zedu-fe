"use client";
import React, { useContext, useEffect, useState } from "react";
import { GetRequest, PostRequest } from "~/utils/new-request";
import { DataContext } from "~/store/GlobalState";
import ChatConnection from "~/components/layout/centrifugo/chat-connection";
import { useParams } from "next/navigation";
import PeopleHeader from "../../../_components/people-nav";
import AgentMessage from "../../../_components/agent-message";
import MessageBox from "../../../_components/message-box";
import ProfileSidebar from "../../../_components/profile-sidebar";

const Page = () => {
  const { state } = useContext(DataContext);
  const { orgId } = state;
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;

  // get the participant infor
  useEffect(() => {
    const getUser = async () => {
      const res = await GetRequest(
        `/organisations/${orgId}/dms/participants/${id}`
      );
      if (res?.status === 200 || res?.status === 201) {
        setParticipant(res?.data?.data?.participants[0]);
      }
      setLoading(false);
    };

    if (orgId) {
      getUser();
    }
  }, []);

  const handleSendMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    const secondPayload = {
      content: content,
      media: medias,
      mentions: state?.mentions,
    };

    await PostRequest(`/dms/channels/${id}/threads`, secondPayload);
  };

  //

  return (
    <div className="flex h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <ChatConnection />
      <div className={`relative flex flex-col flex-1`}>
        <PeopleHeader user={participant} />

        <AgentMessage participant={participant} />

        <div className="absolute bottom-0 w-full">
          <MessageBox
            subscription={state?.chatSubscription}
            sendMessage={handleSendMessage}
          />
        </div>
      </div>

      <div
        className={`fixed mt-[60px] right-0 top-0 z-20 w-full sm:w-[408px] h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_25px_0px_#DFDFDF] ${state?.showProfile ? "translate-x-0" : "translate-x-full"}`}
      >
        <ProfileSidebar user={participant} />
      </div>
    </div>
  );
};

export default Page;
