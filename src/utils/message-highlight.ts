const HIGHLIGHT_STORAGE_KEY = "data-id";

export function setMessageHighlight(threadId: string) {
  if (!threadId) return;
  localStorage.setItem(HIGHLIGHT_STORAGE_KEY, threadId);
}

export function getMessageHighlightId(): string | null {
  return localStorage.getItem(HIGHLIGHT_STORAGE_KEY);
}

export function clearMessageHighlight() {
  localStorage.removeItem(HIGHLIGHT_STORAGE_KEY);
}

export const MESSAGE_HIGHLIGHT_CLASS =
  "bg-yellow-100 dark:bg-yellow-500/25 ring-2 ring-yellow-200 dark:ring-yellow-500/40";

/** Individual tokens for `classList` (one string with spaces is invalid). */
export const MESSAGE_HIGHLIGHT_CLASSES = MESSAGE_HIGHLIGHT_CLASS.split(/\s+/);

export function applyMessageHighlightClasses(element: HTMLElement): void {
  element.classList.add(...MESSAGE_HIGHLIGHT_CLASSES);
}

export function removeMessageHighlightClasses(element: HTMLElement): void {
  element.classList.remove(...MESSAGE_HIGHLIGHT_CLASSES);
}

export const MESSAGE_HIGHLIGHT_DURATION_MS = 2500;

export type HighlightableMessage = {
  thread_id?: string;
  id?: string;
  message_id?: string;
};

export function messageMatchesHighlight(
  chat: HighlightableMessage,
  highlightId: string
): boolean {
  const target = String(highlightId);
  return [chat.thread_id, chat.id, chat.message_id]
    .filter((value) => value != null && String(value) !== "")
    .some((value) => String(value) === target);
}

export function getThreadDomId(chat: HighlightableMessage): string {
  return String(chat.thread_id ?? chat.id ?? "");
}

export function findHighlightMessageElement(
  highlightId: string,
  chats: HighlightableMessage[] = []
): HTMLElement | null {
  const direct =
    document.getElementById(`thread-${highlightId}`) ||
    document.getElementById(`reply-${highlightId}`);

  if (direct) return direct;

  const match = chats.find((chat) =>
    messageMatchesHighlight(chat, highlightId)
  );
  if (!match) return null;

  const domId = getThreadDomId(match);
  if (!domId) return null;

  return (
    document.getElementById(`thread-${domId}`) ||
    document.getElementById(`reply-${domId}`)
  );
}

export function scrollHighlightMessageIntoView(element: HTMLElement): void {
  const container = document.getElementById("scrollableDivs");

  if (!container) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
  const targetTop =
    relativeTop - container.clientHeight / 2 + elementRect.height / 2;

  container.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });
}
