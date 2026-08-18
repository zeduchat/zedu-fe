"use client";
import React, { useContext, useEffect, useState } from "react";
import ThreadsSidebar from "../../../../_components/threads-sidebar";
import ProfileSidebar from "../../../../_components/profile-sidebar";
import MessageBox from "../../../../_components/message-box";
import { DataContext } from "~/store/GlobalState";
import PeopleHeader from "../../../../_components/people-nav";
import { GetRequest, PostRequest } from "~/utils/new-request";
import PeopleMessage from "../../../../_components/people-message";
import ChatConnection from "~/components/layout/centrifugo/chat-connection";
import { useParams } from "next/navigation";
import UsePeopleReply from "../../../../home/channels/hooks/people-reply";

const DmPage = () => {
  const { state } = useContext(DataContext);
  const { orgId, reply } = state;
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const params = useParams();
  const id = params.id as string;
  const id2 = params.id2 as string;
  const { fetchMoreData, hasMore } = UsePeopleReply();

  // get the participant infor
  useEffect(() => {
    const getUser = async () => {
      const res = await GetRequest(
        `/organisations/${orgId}/dms/participants/${id}`
      );
      if (res?.status === 200 || res?.status === 201) {
        setParticipant(res?.data?.data[0]);
      }
      setLoading(false);
    };

    if (orgId) {
      getUser();
    }
  }, [id2, orgId]);

  const handleSendMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    const secondPayload = {
      content: content,
      thread_id: uuid,
      media: medias,
    };

    await PostRequest(`/dms/channels/${id}/threads`, secondPayload);
  };

  const handleReplyMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    const payload = {
      content: content,
      thread_id: state?.thread?.thread_id,
      media: medias,
    };

    // save the data to the database
    await PostRequest(`/dms/messages/${id}`, payload);
  };

  //

  return (
    <div className="flex h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <ChatConnection />
      <div
        className={`flex flex-col flex-1 transition-[margin] duration-300 ease-in-out ${showProfile ? "mr-[408px]" : ""} ${reply ? "mr-[440px]" : ""}`}
      >
        <PeopleHeader user={participant} />

        <PeopleMessage
          participant={participant}
          setShowProfile={setShowProfile}
          showProfile={showProfile}
        />

        <div className="absolute bottom-0 w-full">
          <MessageBox
            subscription={state?.chatSubscription}
            sendMessage={handleSendMessage}
          />
        </div>
      </div>

      <div
        className={`fixed mt-[60px] right-0 top-0 w-full sm:w-[408px] h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_27px_0px_#DFDFDF] transition-transform duration-300 ease-in-out ${state?.showProfile ? "translate-x-0" : "translate-x-full"}`}
      >
        <ProfileSidebar user={participant} />
      </div>

      <div
        className={`fixed mt-[60px] right-0 top-0 w-full sm:w-[440px] h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_27px_0px_#DFDFDF] transition-transform duration-300 ease-in-out ${reply ? "translate-x-0" : "translate-x-full"}`}
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
