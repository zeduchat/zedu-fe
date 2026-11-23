"use client";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import NewChatHeader from "../../../_components/new-chat-header";
import { User } from "../../../_components/new-chat-header";
import { PostRequest } from "~/utils/new-request";
import FirstPeopleMessage from "../../../_components/first-people-message";
import FirstMessageBox from "../../../_components/first-message-box";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { showError } from "~/components/toast/sonner";
import PeopleMessage from "~/app/(client)/[org]/_components/people-message";
import GroupMessage from "~/app/(client)/[org]/_components/group-message";
import Loading from "~/components/ui/loading";
import {
  type LoadedConversation,
  resolveDirectDmForSelection,
  resolveGroupDmForSelection,
} from "~/lib/dm/load-new-chat-conversation";
import ProfileSidebar from "~/app/(client)/[org]/_components/profile-sidebar";
import { useIsSmUp } from "~/hooks/use-media-query";
import { cn } from "~/lib/utils";

type CreatedChat = {
  recipients: string;
  channelId: string;
  participantId?: string;
};

const recipientsKey = (users: User[]) =>
  users
    .map((user) => user.id)
    .sort()
    .join(",");

const NewChat = () => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [conversation, setConversation] = useState<LoadedConversation | null>(
    null
  );
  const [conversationLoading, setConversationLoading] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug, participant, participants, dms, homeDms, user } = state;
  const dmListsRef = useRef([dms, homeDms]);
  dmListsRef.current = [dms, homeDms];
  const createdChat = useRef<CreatedChat | null>(null);
  const loadGenerationRef = useRef(0);
  const isSmUp = useIsSmUp();

  useEffect(() => {
    dispatch({ type: ACTIONS.CLEAR_CHATS });
    dispatch({ type: ACTIONS.PARTICIPANTS, payload: [] });
    dispatch({ type: ACTIONS.PARTICIPANT, payload: null });
    return () => {
      dispatch({ type: ACTIONS.SHOW_PROFILE, payload: false });
    };
  }, [dispatch]);

  useEffect(() => {
    const orgId =
      state.orgId ||
      (typeof window !== "undefined"
        ? localStorage.getItem("orgId") || ""
        : "");

    if (selectedUsers.length === 0) {
      setConversation(null);
      createdChat.current = null;
      dispatch({ type: ACTIONS.CLEAR_CHATS });
      dispatch({ type: ACTIONS.PARTICIPANTS, payload: [] });
      dispatch({ type: ACTIONS.PARTICIPANT, payload: null });
      return;
    }

    const generation = ++loadGenerationRef.current;
    const key = recipientsKey(selectedUsers);

    const run = async () => {
      setConversationLoading(true);
      setConversation(null);
      dispatch({ type: ACTIONS.CLEAR_CHATS });

      let loaded: LoadedConversation | null = null;

      if (selectedUsers.length === 1) {
        const recipient = selectedUsers[0];
        loaded = resolveDirectDmForSelection(
          { ...recipient, user_id: recipient.id },
          dmListsRef.current,
          dispatch
        );
      } else {
        loaded = await resolveGroupDmForSelection(
          orgId,
          selectedUsers.map((u) => u.id),
          dmListsRef.current,
          String(user?.user_id ?? user?.id ?? ""),
          dispatch
        );
      }

      if (generation !== loadGenerationRef.current) return;

      setConversation(loaded);
      setConversationLoading(false);

      if (loaded) {
        createdChat.current = {
          recipients: key,
          channelId: loaded.channelId,
          participantId:
            loaded.kind === "dm" ? loaded.participantId : undefined,
        };
      } else {
        createdChat.current = null;
      }
    };

    void run();
  }, [dispatch, selectedUsers, state.orgId, user?.id, user?.user_id]);

  const placeholderText = useMemo(() => {
    if (!selectedUsers || selectedUsers.length === 0) {
      return "Select a recipient above to start messaging...";
    }
    if (selectedUsers.length === 1) {
      const recipientName =
        selectedUsers[0].name || selectedUsers[0].username || "recipient";
      return `Message @${recipientName}`;
    }
    return `Message group (${selectedUsers.length} members)...`;
  }, [selectedUsers]);

  const handleSendMessage = async (
    uuid: string,
    content: string,
    medias: unknown[]
  ): Promise<{ destination: string } | false> => {
    if (selectedUsers.length < 1 || selectedUsers.length > 9) {
      showError("Select between 1 and 9 people before sending.");
      return false;
    }

    const orgId = localStorage.getItem("orgId") || "";
    const recipients = recipientsKey(selectedUsers);
    const isDirectMessage = selectedUsers.length === 1;

    try {
      let chat = createdChat.current;
      if (!chat || chat.recipients !== recipients) {
        const res = isDirectMessage
          ? await PostRequest(`/organisations/${orgId}/dms`, {
              chat_type: "user",
              participant_id: selectedUsers[0].id,
            })
          : await PostRequest(`/organisations/${orgId}/group-dms`, {
              chat_type: "user",
              participants: selectedUsers.map((user) => user.id),
            });

        if (res?.status !== 200 && res?.status !== 201) {
          showError("Could not start the conversation. Please try again.");
          return false;
        }

        const channelId = res?.data?.data?.channel_id;
        const participantId = res?.data?.data?.participant_id;
        if (!channelId || (isDirectMessage && !participantId)) {
          showError("Could not start the conversation. Please try again.");
          return false;
        }

        chat = { recipients, channelId, participantId };
        createdChat.current = chat;
      }

      const messageRes = isDirectMessage
        ? await PostRequest(`/dms/channels/${chat.channelId}/threads`, {
            content,
            thread_id: uuid,
            media: medias,
          })
        : await PostRequest(`/group-dms/channels/${chat.channelId}/threads`, {
            content,
            media: medias,
          });

      if (messageRes?.status !== 200 && messageRes?.status !== 201) {
        showError(
          "Could not send your message. Your draft is saved. Try again."
        );
        return false;
      }

      dispatch({
        type: ACTIONS.GROUP_CALLBACK,
        payload: !state?.groupCallback,
      });
      dispatch({ type: ACTIONS.HOME_DMS_CALLBACK });
      dispatch({ type: ACTIONS.CREATE_CALLBACK });
      return {
        destination: isDirectMessage
          ? `/${orgSlug}/home/people/${chat.channelId}/${chat.participantId}/dm`
          : `/${orgSlug}/home/people/${chat.channelId}/dms`,
      };
    } catch {
      showError("Could not send your message. Your draft is saved. Try again.");
      return false;
    }
  };

  const dmParticipant =
    participant ??
    (selectedUsers.length === 1
      ? {
          user_id: selectedUsers[0].id,
          username: selectedUsers[0].username || selectedUsers[0].name,
          avatar_url:
            selectedUsers[0].avatar_url || selectedUsers[0].profile_url,
          default_avatar_url: selectedUsers[0].default_avatar_url,
        }
      : null);

  const profileChannelId =
    conversation?.kind === "dm" ? conversation.channelId : undefined;
  const showProfilePanel =
    Boolean(state?.showProfile) &&
    isSmUp &&
    selectedUsers.length === 1 &&
    Boolean(dmParticipant);

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <NewChatHeader onUsersSelected={setSelectedUsers} />

      <div
        className={cn(
          "relative flex flex-1 min-h-0 flex-col w-full overflow-hidden transition-[margin] duration-300 ease-in-out"
        )}
        style={{ marginRight: showProfilePanel ? 408 : 0 }}
      >
        {conversationLoading && (
          <div className="flex flex-1 items-center justify-center">
            <Loading />
          </div>
        )}

        {!conversationLoading &&
          selectedUsers.length > 0 &&
          conversation?.kind === "dm" && (
            <PeopleMessage
              participant={dmParticipant}
              channelId={conversation.channelId}
              markReadOnView={false}
            />
          )}

        {!conversationLoading &&
          selectedUsers.length > 1 &&
          conversation?.kind === "group" && (
            <GroupMessage
              participants={participants}
              channelId={conversation.channelId}
              markReadOnView={false}
            />
          )}

        {!conversationLoading &&
          (selectedUsers.length === 0 || !conversation) && (
            <FirstPeopleMessage selectedUsers={selectedUsers} />
          )}

        <div className="absolute bottom-0 left-0 right-[17px] z-20">
          <FirstMessageBox
            sendMessage={handleSendMessage}
            placeholder={placeholderText}
            autoFocusEditor={false}
            disabled={
              !selectedUsers ||
              selectedUsers.length === 0 ||
              conversationLoading
            }
          />
        </div>
      </div>

      {showProfilePanel && (
        <div className="fixed z-30 right-0 top-[60px] bottom-0 w-[408px] bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_27px_0px_#DFDFDF]">
          <ProfileSidebar user={dmParticipant} channelId={profileChannelId} />
        </div>
      )}
    </div>
  );
};

export default NewChat;
