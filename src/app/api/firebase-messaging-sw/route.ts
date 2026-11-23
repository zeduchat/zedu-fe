import { NextResponse } from "next/server";
import {
  HIDDEN_PREVIEW_TEXT,
  PREVIEW_CACHE_KEY,
  PREVIEW_CACHE_NAME,
} from "~/lib/notification-preview";
import {
  FCM_NAV_CACHE_KEY,
  FCM_NAV_CACHE_NAME,
  FCM_NOTIFICATION_CLICK,
} from "~/lib/firebase/fcm-notification-constants";

export const dynamic = "force-dynamic";

const firebaseVersion = "12.19.0";

export function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  const script = `
importScripts("https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-messaging-compat.js");

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

const PREVIEW_CACHE_NAME = ${JSON.stringify(PREVIEW_CACHE_NAME)};
const PREVIEW_CACHE_KEY = ${JSON.stringify(PREVIEW_CACHE_KEY)};
const HIDDEN_PREVIEW_TEXT = ${JSON.stringify(HIDDEN_PREVIEW_TEXT)};

// Reads the "Show message previews" setting saved by the page.
// Defaults to showing previews if nothing is saved.
async function showMessagePreviews() {
  try {
    const cache = await caches.open(PREVIEW_CACHE_NAME);
    const response = await cache.match(PREVIEW_CACHE_KEY);
    if (!response) return true;
    const data = await response.json();
    return data.showPreviews !== false;
  } catch (error) {
    return true;
  }
}

// The Firebase SDK keeps the push it showed itself under this data key.
const FCM_MSG_KEY = "FCM_MSG";

messaging.onBackgroundMessage(async (payload) => {
  // console.log("[FCM SW] incoming push (background)", payload);

  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  const hasVisibleClient = clientList.some(
    (client) => client.visibilityState === "visible"
  );
  if (hasVisibleClient) {
    console.log(
      "[FCM SW] skipping background display — visible tab (foreground onMessage shows tray)"
    );
    return;
  }

  const title = payload.notification?.title || payload.data?.title || "Zedu";
  const rawBody = payload.notification?.body || payload.data?.body || "";
  const showPreviews = await showMessagePreviews();

  // When the push has a "notification" part, the SDK has already shown it,
  // with the full message text, before calling this handler.
  if (payload.notification) {
    // Showing our own copy as well would give two notifications per message.
    if (showPreviews || !rawBody) return;

    // Previews are off: replace the SDK's notification with one that hides the text.
    const shown = await self.registration.getNotifications();
    shown
      .filter(
        (notification) =>
          notification.data?.[FCM_MSG_KEY]?.fcmMessageId === payload.messageId
      )
      .forEach((notification) => notification.close());
  }

  const body = rawBody && !showPreviews ? HIDDEN_PREVIEW_TEXT : rawBody;
  const data = payload.data || {};
  const tag =
    data.message_id ||
    data.thread_id ||
    payload.messageId ||
    "zedu-push";

  return self.registration.showNotification(title, {
    body,
    tag: String(tag).slice(0, 64),
    renotify: true,
    data,
  });
});

const FCM_NAV_CACHE = ${JSON.stringify(FCM_NAV_CACHE_NAME)};
const FCM_NAV_KEY = ${JSON.stringify(FCM_NAV_CACHE_KEY)};
const FCM_CLICK_MSG = ${JSON.stringify(FCM_NOTIFICATION_CLICK)};

// Flatten FCM click data (direct data map or nested FCM_MSG from the SDK).
function flattenFcmClickData(data) {
  if (!data || typeof data !== "object") return {};

  const out = {};
  Object.entries(data).forEach(([key, value]) => {
    if (key === FCM_MSG_KEY && value && typeof value === "object") {
      Object.assign(out, flattenFcmClickData(value));
      if (value.data && typeof value.data === "object") {
        Object.assign(out, flattenFcmClickData(value.data));
      }
      return;
    }
    if (typeof value === "string") {
      out[key] = value;
    }
  });
  return out;
}

async function stashPendingNav(data) {
  try {
    const cache = await caches.open(FCM_NAV_CACHE);
    await cache.put(
      FCM_NAV_KEY,
      new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (error) {
    // ignore cache errors
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const clickData = flattenFcmClickData(event.notification.data);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clientList) => {
        const message = { type: FCM_CLICK_MSG, data: clickData };

        for (const client of clientList) {
          if (!("focus" in client)) continue;
          client.postMessage(message);
          return client.focus();
        }

        await stashPendingNav(clickData);
        return self.clients.openWindow("/");
      })
  );
});
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
