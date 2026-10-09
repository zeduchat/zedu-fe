import type { Dispatch } from "react";
import { ACTIONS } from "~/store/Actions";
import { setMessageHighlight } from "~/utils/message-highlight";

/**
 * Request in-conversation scroll/highlight (handled by `useMessageHighlight`).
 */
export function jumpToMessageInConversation(
  highlightId: string,
  dispatch: Dispatch<{ type: string; payload?: unknown }>
) {
  if (!highlightId) return;

  setMessageHighlight(highlightId);
  dispatch({ type: ACTIONS.DATA_ID, payload: null });

  window.setTimeout(() => {
    dispatch({ type: ACTIONS.DATA_ID, payload: highlightId });
  }, 0);
}
