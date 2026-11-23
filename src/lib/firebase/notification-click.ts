"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { openBuzzInNewTab } from "~/lib/buzz/open-buzz-tab";
import {
  normalizeNotificationPayload,
  resolveNotificationRoute,
  storeMessageHighlightId,
} from "~/lib/onesignal/notification-route";
import {
  FCM_NAV_CACHE_KEY,
  FCM_NAV_CACHE_NAME,
} from "~/lib/firebase/fcm-notification-constants";

export {
  FCM_NAV_CACHE_KEY,
  FCM_NAV_CACHE_NAME,
  FCM_NOTIFICATION_CLICK,
} from "~/lib/firebase/fcm-notification-constants";

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

export const applyNotificationNavigationContext = (
  data: Record<string, unknown>
) => {
  if (typeof window === "undefined") return;

  const orgId = getString(data.org_id);
  if (orgId) {
    localStorage.setItem("orgId", orgId);
  }

  const channelId = getString(data.channel_id) || getString(data.channels_id);
  if (channelId) {
    localStorage.setItem("channelId", channelId);
  }

  const channelName =
    getString(data.channel_name) || getString(data.sender_name);
  if (channelName) {
    localStorage.setItem("channelName", channelName);
  }
};

export const navigateFromFirebasePushData = (
  raw: Record<string, unknown>,
  router: AppRouterInstance
) => {
  const data = normalizeNotificationPayload(raw);
  applyNotificationNavigationContext(data);

  const nextRoute = resolveNotificationRoute(data);
  if (!nextRoute) return;

  storeMessageHighlightId(data);

  if (/\/buzz\/[^/]+$/.test(nextRoute)) {
    const parts = nextRoute.split("/");
    const orgSlug = parts[1];
    const buzzId = parts[parts.length - 1];
    if (orgSlug && buzzId) {
      openBuzzInNewTab(orgSlug, buzzId);
      return;
    }
  }

  router.push(nextRoute);
};

export const consumePendingFirebaseNav = async (
  router: AppRouterInstance
): Promise<Record<string, unknown> | null> => {
  if (typeof window === "undefined" || !("caches" in window)) return null;

  try {
    const cache = await caches.open(FCM_NAV_CACHE_NAME);
    const response = await cache.match(FCM_NAV_CACHE_KEY);
    if (!response) return null;

    const raw = (await response.json()) as Record<string, unknown>;
    await cache.delete(FCM_NAV_CACHE_KEY);
    navigateFromFirebasePushData(raw, router);
    return raw;
  } catch {
    return null;
  }
};
