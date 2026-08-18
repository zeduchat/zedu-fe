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

export const MESSAGE_HIGHLIGHT_CLASS = "bg-yellow-100";
export const MESSAGE_HIGHLIGHT_DURATION_MS = 1500;
