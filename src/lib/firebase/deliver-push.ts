import {
  applyPreviewPreference,
  getShowMessagePreviews,
} from "~/lib/notification-preview";
// In-app chime disabled: Windows/macOS play the OS notification sound for tray toasts.
// import {
//   isMessageLikePushData,
//   playIncomingMessageSound,
// } from "~/lib/notifications/play-incoming-message-sound";
import { normalizeNotificationPayload } from "~/lib/onesignal/notification-route";

const DUPLICATE_MS = 2_500;
const recentKeys = new Map<string, number>();

export type FcmLikePayload = {
  messageId?: string;
  notification?: { title?: string; body?: string };
  data?: Record<string, string>;
};

export const getFcmDeliveryKey = (payload: FcmLikePayload): string => {
  const id = payload.messageId || payload.data?.messageId;
  if (id) return `id:${id}`;

  const data = payload.data || {};
  const threadId = data.thread_id || data.message_id;
  if (threadId) return `thread:${threadId}`;

  const title = payload.notification?.title || data.title || "";
  const body = payload.notification?.body || data.body || data.content || "";
  return `text:${title}::${body}`;
};

const isDuplicateDelivery = (key: string): boolean => {
  const now = Date.now();
  const previous = recentKeys.get(key);
  if (previous != null && now - previous < DUPLICATE_MS) {
    return true;
  }
  recentKeys.set(key, now);
  if (recentKeys.size > 200) {
    for (const [k, at] of recentKeys) {
      if (now - at > DUPLICATE_MS * 2) recentKeys.delete(k);
    }
  }
  return false;
};

const toStringData = (raw: Record<string, unknown>): Record<string, string> => {
  const normalized = normalizeNotificationPayload(raw) as Record<
    string,
    unknown
  >;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(normalized)) {
    if (typeof value === "string") out[key] = value;
    else if (value != null) out[key] = String(value);
  }
  return out;
};

/** One tray notification per logical FCM message (foreground tab). */
export const deliverForegroundFcmNotification = async (
  payload: FcmLikePayload
): Promise<void> => {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }

  const deliveryKey = getFcmDeliveryKey(payload);
  if (isDuplicateDelivery(deliveryKey)) {
    console.log("[FCM] skipped duplicate delivery", deliveryKey);
    return;
  }

  const title = payload.notification?.title || payload.data?.title || "Zedu";
  const rawBody =
    payload.notification?.body ||
    payload.data?.body ||
    payload.data?.content ||
    "";
  const body = applyPreviewPreference(rawBody, getShowMessagePreviews());
  const stringData = toStringData(payload.data || {});

  const tag =
    stringData.message_id ||
    stringData.thread_id ||
    deliveryKey.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);

  // if (isMessageLikePushData(payload.data || {})) {
  //   playIncomingMessageSound(payload.data || {}, { dedupeKey: deliveryKey });
  // }

  if (!("serviceWorker" in navigator)) {
    new Notification(title, { body, tag });
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      tag,
      data: stringData,
    });
    console.log("[FCM] showing OS notification", { title, body, tag });
  } catch {
    new Notification(title, { body, tag });
  }
};
