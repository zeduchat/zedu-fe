import { useEffect, useRef } from "react";
import {
  clearMessageHighlight,
  getMessageHighlightId,
  MESSAGE_HIGHLIGHT_CLASS,
  MESSAGE_HIGHLIGHT_DURATION_MS,
} from "~/utils/message-highlight";

const MAX_FETCH_ATTEMPTS = 20;

interface UseMessageHighlightOptions {
  dataId?: string;
  loading: boolean;
  chats: Array<{ thread_id?: string }>;
  hasMore: boolean;
  fetchMoreData: () => void;
}

export function useMessageHighlight({
  dataId,
  loading,
  chats,
  hasMore,
  fetchMoreData,
}: UseMessageHighlightOptions) {
  const highlightedRef = useRef(false);
  const fetchAttemptsRef = useRef(0);
  const lastHighlightIdRef = useRef<string | null>(null);

  useEffect(() => {
    const highlightId = getMessageHighlightId() || dataId || null;

    if (highlightId !== lastHighlightIdRef.current) {
      highlightedRef.current = false;
      fetchAttemptsRef.current = 0;
      lastHighlightIdRef.current = highlightId;
    }

    if (!highlightId || highlightedRef.current) return;

    const highlightElement = () => {
      const el =
        document.getElementById(`thread-${highlightId}`) ||
        document.getElementById(`reply-${highlightId}`);

      if (!el) return false;

      el.scrollIntoView({ behavior: "auto", block: "center" });
      el.classList.add(MESSAGE_HIGHLIGHT_CLASS);

      setTimeout(() => {
        el.classList.remove(MESSAGE_HIGHLIGHT_CLASS);
      }, MESSAGE_HIGHLIGHT_DURATION_MS);

      clearMessageHighlight();
      highlightedRef.current = true;
      return true;
    };

    if (highlightElement()) return;

    const messageInList = chats.some((chat) => chat.thread_id === highlightId);

    if (messageInList) {
      requestAnimationFrame(() => {
        if (!highlightElement()) {
          setTimeout(() => highlightElement(), 100);
        }
      });
      return;
    }

    if (!loading && hasMore && fetchAttemptsRef.current < MAX_FETCH_ATTEMPTS) {
      fetchAttemptsRef.current += 1;
      fetchMoreData();
    }
  }, [dataId, loading, chats, hasMore, fetchMoreData]);
}
