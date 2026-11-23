type DmListEntry = {
  channel_type?: string;
  channel_id?: string | number;
  channels_id?: string | number;
  participant_id?: string | number;
  participants?: Array<{ user_id?: string | number; id?: string | number }>;
};

export function findExistingDirectDm(
  lists: Array<DmListEntry[] | null | undefined>,
  otherUserId: string
): { channelId: string; participantId: string } | null {
  const target = String(otherUserId);

  for (const list of lists) {
    for (const dm of list || []) {
      if (dm.channel_type !== "dm") continue;

      const channelId = String(dm.channel_id ?? dm.channels_id ?? "");
      if (!channelId) continue;

      if (String(dm.participant_id) === target) {
        return {
          channelId,
          participantId: String(dm.participant_id),
        };
      }

      const peer = dm.participants?.[0];
      const peerId = String(peer?.user_id ?? peer?.id ?? "");
      if (peerId === target) {
        return {
          channelId,
          participantId: String(dm.participant_id ?? peerId),
        };
      }
    }
  }

  return null;
}

export function findExistingGroupDm(
  lists: Array<DmListEntry[] | null | undefined>,
  selectedParticipantIds: string[],
  currentUserId?: string
): { channelId: string } | null {
  const want = new Set(selectedParticipantIds.map(String).filter(Boolean));
  if (currentUserId) want.add(String(currentUserId));

  for (const list of lists) {
    for (const dm of list || []) {
      if (dm.channel_type === "dm") continue;

      const channelId = String(dm.channel_id ?? dm.channels_id ?? "");
      if (!channelId) continue;

      const dmIds = new Set(
        (dm.participants || [])
          .map((p) => String(p.user_id ?? p.id ?? ""))
          .filter(Boolean)
      );

      if (dmIds.size !== want.size) continue;
      let matches = true;
      for (const id of want) {
        if (!dmIds.has(id)) {
          matches = false;
          break;
        }
      }
      if (matches) return { channelId };
    }
  }

  return null;
}
