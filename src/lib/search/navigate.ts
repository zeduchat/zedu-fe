import type { Dispatch } from "react";
import { ACTIONS } from "~/store/Actions";
import type { MessageSearchResult } from "~/lib/search/types";
import { setMessageHighlight } from "~/utils/message-highlight";

type NavigateArgs = {
  result: MessageSearchResult;
  orgSlug?: string | null;
  router: { push: (href: string) => void };
  dispatch: Dispatch<{ type: string; payload?: unknown }>;
};

const isDmChannelType = (value?: string | null) => {
  const type = (value || "").toLowerCase().replace(/[\s_-]/g, "");
  return (
    type === "dm" ||
    type === "directmessage" ||
    type === "groupdm" ||
    type === "groupdirectmessage"
  );
};

/**
 * Open a message search hit: store highlight id, update global dataId,
 * then route to the matching channel or DM conversation.
 */
export function openSearchMessageResult({
  result,
  orgSlug,
  router,
  dispatch,
}: NavigateArgs) {
  if (!orgSlug) return;

  const channelId = result.channel?.channel_id;
  if (!channelId) return;

  const messageId = result.messages?.[0]?.message_id;
  if (messageId) {
    setMessageHighlight(messageId);
    dispatch({ type: ACTIONS.DATA_ID, payload: messageId });
  }

  if (result.channel.channel_name) {
    localStorage.setItem("channelName", result.channel.channel_name);
  }
  localStorage.setItem("channelId", channelId);

  if (isDmChannelType(result.channel.channel_type)) {
    const threadQuery = messageId
      ? `?thread_id=${encodeURIComponent(messageId)}`
      : "";
    router.push(`/${orgSlug}/dms/${channelId}${threadQuery}`);
    return;
  }

  const channelQuery = messageId
    ? `?thread_id=${encodeURIComponent(messageId)}`
    : "";
  router.push(`/${orgSlug}/home/channels/${channelId}${channelQuery}`);
}
