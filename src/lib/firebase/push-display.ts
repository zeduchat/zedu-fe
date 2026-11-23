import { normalizeNotificationPayload } from "~/lib/onesignal/notification-route";

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

/** channel_id for the conversation currently open (DM, group DM, or channel). */
export const getActiveConversationChannelId = (): string | null => {
  if (typeof window === "undefined") return null;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const homeIdx = parts.indexOf("home");

  if (homeIdx !== -1) {
    const section = parts[homeIdx + 1];
    if (section === "channels" && parts[homeIdx + 2]) {
      return parts[homeIdx + 2] ?? null;
    }
    if (section === "people" && parts[homeIdx + 2]) {
      return parts[homeIdx + 2] ?? null;
    }
    return null;
  }

  const dmIdx = parts.indexOf("dm");
  if (dmIdx !== -1 && parts[dmIdx + 1]) {
    return parts[dmIdx + 1] ?? null;
  }

  const laterDmIdx = parts.indexOf("later");
  if (
    laterDmIdx !== -1 &&
    parts[laterDmIdx + 1] === "dm" &&
    parts[laterDmIdx + 2]
  ) {
    return parts[laterDmIdx + 2] ?? null;
  }

  return null;
};

export const isViewingPushConversation = (
  raw: Record<string, unknown> = {}
): boolean => {
  const data = normalizeNotificationPayload(raw);
  const channelId = getString(data.channel_id) || getString(data.channels_id);
  if (!channelId) return false;

  const active = getActiveConversationChannelId();
  return Boolean(active && active === channelId);
};
