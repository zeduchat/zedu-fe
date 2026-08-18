import { useContext, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { setMessageHighlight } from "~/utils/message-highlight";

interface UseMessageDeepLinkOptions {
  messages: Array<{ thread_id?: string }>;
  loading?: boolean;
}

export function useMessageDeepLink({
  messages,
  loading = false,
}: UseMessageDeepLinkOptions) {
  const searchParams = useSearchParams();
  const { dispatch } = useContext(DataContext);
  const appliedRef = useRef<string | null>(null);

  const threadId = searchParams.get("thread_id");
  const messageId = searchParams.get("message_id");

  useEffect(() => {
    if (!threadId) {
      appliedRef.current = null;
      return;
    }

    const signature = `${threadId}:${messageId || ""}`;
    if (appliedRef.current === signature) return;

    const highlightId = threadId;

    setMessageHighlight(highlightId);
    dispatch({ type: ACTIONS.DATA_ID, payload: highlightId });

    if (messageId && !loading && messages?.length) {
      const parentThread = messages.find(
        (message) => message.thread_id === threadId
      );

      if (parentThread) {
        dispatch({ type: ACTIONS.THREAD, payload: parentThread });
        dispatch({ type: ACTIONS.REPLY, payload: true });
      }
    }

    appliedRef.current = signature;
  }, [threadId, messageId, messages, loading, dispatch]);
}
