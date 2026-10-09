import { useEffect, useRef } from "react";
import {
  applyMessageHighlightClasses,
  clearMessageHighlight,
  findHighlightMessageElement,
  getMessageHighlightId,
  messageMatchesHighlight,
  MESSAGE_HIGHLIGHT_DURATION_MS,
  removeMessageHighlightClasses,
  scrollHighlightMessageIntoView,
  type HighlightableMessage,
} from "~/utils/message-highlight";

const MAX_FETCH_ATTEMPTS = 30;
const RETRY_DELAYS_MS = [0, 50, 120, 250, 400, 650, 900, 1200, 1600];

interface UseMessageHighlightOptions {
  dataId?: string;
  loading: boolean;
  chats: HighlightableMessage[];
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
  const retryTimersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      retryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      retryTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (dataId == null && getMessageHighlightId()) {
      highlightedRef.current = false;
    }
  }, [dataId]);

  useEffect(() => {
    const highlightId = getMessageHighlightId() || dataId || null;

    if (highlightId !== lastHighlightIdRef.current) {
      highlightedRef.current = false;
      fetchAttemptsRef.current = 0;
      lastHighlightIdRef.current = highlightId;
      retryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      retryTimersRef.current = [];
    }

    if (!highlightId || highlightedRef.current) return;

    const applyHighlight = (): boolean => {
      const el = findHighlightMessageElement(highlightId, chats);
      if (!el) return false;

      scrollHighlightMessageIntoView(el);
      applyMessageHighlightClasses(el);

      window.setTimeout(() => {
        removeMessageHighlightClasses(el);
      }, MESSAGE_HIGHLIGHT_DURATION_MS);

      clearMessageHighlight();
      highlightedRef.current = true;
      return true;
    };

    if (applyHighlight()) return;

    const messageInList = chats.some((chat) =>
      messageMatchesHighlight(chat, highlightId)
    );

    if (messageInList) {
      RETRY_DELAYS_MS.forEach((delay) => {
        const timer = window.setTimeout(() => {
          if (!highlightedRef.current) {
            applyHighlight();
          }
        }, delay);
        retryTimersRef.current.push(timer);
      });
      return;
    }

    if (!loading && hasMore && fetchAttemptsRef.current < MAX_FETCH_ATTEMPTS) {
      fetchAttemptsRef.current += 1;
      fetchMoreData();
      return;
    }

    if (!loading && !hasMore) {
      RETRY_DELAYS_MS.forEach((delay) => {
        const timer = window.setTimeout(() => {
          if (!highlightedRef.current) {
            applyHighlight();
          }
        }, delay);
        retryTimersRef.current.push(timer);
      });
    }
  }, [dataId, loading, chats, hasMore, fetchMoreData]);
}
