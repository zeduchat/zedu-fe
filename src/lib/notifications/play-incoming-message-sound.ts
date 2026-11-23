import { getNotificationBadgeKey } from "~/lib/notifications/notification-badge";
import { normalizeNotificationPayload } from "~/lib/onesignal/notification-route";

const MESSAGE_SOUND_PATH = "/audio/new-sound.mp3";
const DEDUPE_MS = 2_500;

let audio: HTMLAudioElement | null = null;
let lastKey = "";
let lastAt = 0;

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

export const isMessageLikePushData = (
  raw: Record<string, unknown> = {}
): boolean => {
  const data = normalizeNotificationPayload(raw);
  const type = (
    getString(data.notification_type) ||
    getString(data.event) ||
    ""
  ).toLowerCase();

  if (
    type === "new_message" ||
    type === "dm" ||
    type === "group_dm" ||
    type === "mention" ||
    type === "channel" ||
    type.includes("message")
  ) {
    return true;
  }

  const section = (getString(data.section) || "").toLowerCase();
  if (
    section === "thread_message" ||
    section === "dm_channels_section" ||
    section === "channels_section"
  ) {
    return Boolean(
      getString(data.channel_id) ||
      getString(data.channels_id) ||
      getString(data.thread_id)
    );
  }

  return Boolean(
    getString(data.channel_id) ||
    getString(data.channels_id) ||
    getString(data.thread_id) ||
    getString(data.message_id)
  );
};

/** Slack-style ping when a message notification arrives (in-app or FCM foreground). */
export const playIncomingMessageSound = (
  raw: Record<string, unknown> = {},
  options?: { dedupeKey?: string }
) => {
  if (typeof window === "undefined") return;
  if (!isMessageLikePushData(raw)) return;

  const key = options?.dedupeKey || getNotificationBadgeKey(raw) || "default";
  const now = Date.now();
  if (key === lastKey && now - lastAt < DEDUPE_MS) return;
  lastKey = key;
  lastAt = now;

  if (!audio) {
    audio = new Audio(MESSAGE_SOUND_PATH);
    audio.preload = "auto";
  }

  audio.currentTime = 0;
  void audio.play().catch((error) => {
    console.warn("[notifications] message sound blocked", error);
  });
};
