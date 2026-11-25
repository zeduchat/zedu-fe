import { useEffect, useRef, type RefObject } from "react";

type Options = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  messages: unknown[] | null | undefined;
  userId?: string | number | null;
  /** Channel / DM id — resets tracking when conversation changes */
  conversationKey?: string;
  onScrolledToLatest?: () => void;
};

const latestMessageKey = (message: any): string => {
  const id = message?.thread_id ?? message?.id;
  return id != null ? String(id) : "";
};

const isFromCurrentUser = (message: any, userId: string | number): boolean => {
  if (message?.isOptimistic) return true;
  const senderId = message?.user_id ?? message?.user?.id;
  return senderId != null && String(senderId) === String(userId);
};

/**
 * column-reverse chats: scrollTop 0 is the latest messages.
 * Jumps there when the user sends (optimistic or confirmed newest thread).
 */
export function useScrollToLatestOnOwnSend({
  scrollContainerRef,
  messages,
  userId,
  conversationKey,
  onScrolledToLatest,
}: Options) {
  const latestSeenKeyRef = useRef<string | null>(null);

  useEffect(() => {
    latestSeenKeyRef.current = null;
  }, [conversationKey]);

  useEffect(() => {
    if (!userId || !messages?.length) return;

    const latest = messages[0] as Record<string, unknown>;
    const latestKey = latestMessageKey(latest);
    if (!latestKey) return;

    if (latestSeenKeyRef.current === null) {
      latestSeenKeyRef.current = latestKey;
      return;
    }

    if (latestKey === latestSeenKeyRef.current) return;
    latestSeenKeyRef.current = latestKey;

    if (!isFromCurrentUser(latest, userId)) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = 0;
      onScrolledToLatest?.();
    });
  }, [messages, userId, scrollContainerRef, onScrolledToLatest]);
}
