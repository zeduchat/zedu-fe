import type { Dispatch } from "react";
import { ACTIONS } from "~/store/Actions";
import { GetRequest } from "~/utils/new-request";
import { showError } from "~/components/toast/sonner";
import { toPreviewParticipant } from "~/lib/dm/open-dm-with-user";
import {
  findExistingDirectDm,
  findExistingGroupDm,
} from "~/lib/dm/find-existing-dm";

type DmUserLike = {
  user_id?: string | null;
  id?: string | null;
  username?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  profile_url?: string | null;
  default_avatar_url?: string | null;
  is_deactivated?: boolean | string;
  is_restricted?: boolean | string;
};

export type LoadedDirectDm = {
  kind: "dm";
  channelId: string;
  participantId: string;
};

export type LoadedGroupDm = {
  kind: "group";
  channelId: string;
};

export type LoadedConversation = LoadedDirectDm | LoadedGroupDm;

const getParticipantId = (user: DmUserLike) =>
  String(user.user_id ?? user.id ?? "");

/** Open an existing 1:1 only — never creates a channel. */
export function resolveDirectDmForSelection(
  user: DmUserLike,
  dmLists: unknown[],
  dispatch: Dispatch<{ type: string; payload?: unknown }>
): LoadedDirectDm | null {
  const participantId = getParticipantId(user);
  if (!participantId) return null;

  dispatch({
    type: ACTIONS.PARTICIPANT,
    payload: toPreviewParticipant(user, participantId),
  });

  const existing = findExistingDirectDm(
    dmLists as Parameters<typeof findExistingDirectDm>[0],
    participantId
  );

  dispatch({
    type: ACTIONS.CHATS,
    payload: { newThreads: [], newPage: 1 },
  });

  if (!existing) {
    return null;
  }

  return {
    kind: "dm",
    channelId: existing.channelId,
    participantId: existing.participantId,
  };
}

/** Open an existing group DM only — never creates a channel. */
export async function resolveGroupDmForSelection(
  orgId: string,
  participantIds: string[],
  dmLists: unknown[],
  currentUserId: string | undefined,
  dispatch: Dispatch<{ type: string; payload?: unknown }>
): Promise<LoadedGroupDm | null> {
  if (participantIds.length < 2) return null;

  const existing = findExistingGroupDm(
    dmLists as Parameters<typeof findExistingGroupDm>[0],
    participantIds,
    currentUserId
  );

  dispatch({
    type: ACTIONS.CHATS,
    payload: { newThreads: [], newPage: 1 },
  });

  if (!existing) {
    dispatch({ type: ACTIONS.PARTICIPANTS, payload: [] });
    return null;
  }

  try {
    const participantsRes = await GetRequest(
      `/organisations/${orgId}/dms/participants/${existing.channelId}`
    );
    if (participantsRes?.status === 200 || participantsRes?.status === 201) {
      const list = participantsRes?.data?.data?.participants ?? [];
      dispatch({ type: ACTIONS.PARTICIPANTS, payload: list });
    } else {
      dispatch({ type: ACTIONS.PARTICIPANTS, payload: [] });
    }
  } catch (error) {
    console.error("Failed to load group participants:", error);
    showError("Could not load the group conversation.");
    dispatch({ type: ACTIONS.PARTICIPANTS, payload: [] });
    return null;
  }

  return { kind: "group", channelId: existing.channelId };
}
