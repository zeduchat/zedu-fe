"use client";

import { useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { ensureCentrifugeConnected } from "~/lib/centrifugo/ensure-connected";
import {
  consumePendingFirebaseNav,
  FCM_NOTIFICATION_CLICK,
  navigateFromFirebasePushData,
} from "~/lib/firebase/notification-click";
import { normalizeNotificationPayload } from "~/lib/onesignal/notification-route";

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const isMessageLikePayload = (data: Record<string, unknown>) => {
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

  return Boolean(
    getString(data.channel_id) ||
    getString(data.channels_id) ||
    getString(data.thread_id) ||
    getString(data.message_id)
  );
};

const resyncFromPush = (
  dispatch: React.Dispatch<any> | undefined,
  raw: Record<string, unknown>
) => {
  if (!dispatch) return;

  const data = normalizeNotificationPayload(raw);
  if (!isMessageLikePayload(data)) return;

  ensureCentrifugeConnected();
  dispatch({ type: ACTIONS.HOME_DMS_CALLBACK });
  dispatch({ type: ACTIONS.TRIGGER_CALLBACK });
};

export default function FirebaseNotificationNavigation() {
  const router = useRouter();
  const context = useContext(DataContext);
  const dispatch = context?.dispatch;
  const dispatchRef = useRef(dispatch);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  useEffect(() => {
    let active = true;

    const handlePushNavigate = (raw: Record<string, unknown>) => {
      resyncFromPush(dispatchRef.current, raw);
      navigateFromFirebasePushData(raw, router);
      window.setTimeout(() => resyncFromPush(dispatchRef.current, raw), 500);
    };

    const onMessage = (event: MessageEvent) => {
      if (!active) return;
      const payload = event.data;
      if (!payload?.type) return;

      if (payload.type !== FCM_NOTIFICATION_CLICK) return;
      if (!payload.data || typeof payload.data !== "object") return;
      console.log("[FCM] notification click", payload.data);
      handlePushNavigate(payload.data as Record<string, unknown>);
    };

    navigator.serviceWorker?.addEventListener("message", onMessage);

    consumePendingFirebaseNav(router).then((pending) => {
      if (!pending) return;
      resyncFromPush(dispatchRef.current, pending);
      window.setTimeout(
        () => resyncFromPush(dispatchRef.current, pending),
        500
      );
    });

    return () => {
      active = false;
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [router]);

  return null;
}
