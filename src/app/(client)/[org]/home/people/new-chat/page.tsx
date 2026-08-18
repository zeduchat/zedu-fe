"use client";
import { useContext, useState } from "react";
import NewChatHeader from "../../../_components/new-chat-header";
import { User } from "../../../_components/new-chat-header";
import { PostRequest } from "~/utils/new-request";
import FirstPeopleMessage from "../../../_components/first-people-message";
import { useRouter } from "next/navigation";
import FirstMessageBox from "../../../_components/first-message-box";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";

const NewChat = () => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const router = useRouter();
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug } = state;

  const handleSendMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    const orgId = localStorage.getItem("orgId") || "";

    // if the selected users is more than one, that means its a group chat
    if (selectedUsers?.length === 1) {
      const firstPayload = {
        chat_type: "user",
        participant_id: selectedUsers[0].id,
      };

      const res = await PostRequest(
        `/organisations/${orgId}/dms`,
        firstPayload
      );

      if (res?.status === 200 || res?.status === 201) {
        dispatch({
          type: ACTIONS.GROUP_CALLBACK,
          payload: !state?.groupCallback,
        });

        router.push(
          `/${orgSlug}/home/people/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}/dm`
        );

        const secondPayload = {
          content: content,
          thread_id: uuid,
          media: medias,
        };
        await PostRequest(
          `/dms/channels/${res?.data?.data?.channel_id}/threads`,
          secondPayload
        );
      }
    } else {
      const payload = {
        chat_type: "user",
        participants: selectedUsers?.map((user) => user.id),
      };

      const res = await PostRequest(
        `/organisations/${orgId}/group-dms`,
        payload
      );

      if (res?.status === 200 || res?.status === 201) {
        dispatch({
          type: ACTIONS.GROUP_CALLBACK,
          payload: !state?.groupCallback,
        });
        router.push(
          `/${orgSlug}/home/people/${res?.data?.data?.channel_id}/dms`
        );

        const secondPayload = {
          content: content,
          media: medias,
        };
        await PostRequest(
          `/group-dms/channels/${res?.data?.data?.channel_id}/threads`,
          secondPayload
        );
      }
    }
  };

  //

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <NewChatHeader onUsersSelected={setSelectedUsers} />

      <FirstPeopleMessage selectedUsers={selectedUsers} />
      <FirstMessageBox sendMessage={handleSendMessage} />
    </div>
  );
};

export default NewChat;
