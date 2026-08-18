"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { PutRequest } from "~/utils/new-request";
import { initOneSignalSafely } from "~/lib/onesignal/init";

export default function OneSignalSubscriptionSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isActive = true;
    let lastSyncedId: string | null = null;

    const waitForSubscriptionId = async (): Promise<string | null> => {
      for (let i = 0; i < 30; i++) {
        if (!isActive) return null;

        const id = OneSignal.User.PushSubscription.id;
        if (id) return id;

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      return null;
    };

    const syncSubscription = async () => {
      try {
        await initOneSignalSafely();
        if (!isActive) return;

        if (!OneSignal.User.PushSubscription.optedIn) {
          await OneSignal.User.PushSubscription.optIn();
        }

        if ("serviceWorker" in navigator) {
          await navigator.serviceWorker.ready;
        }

        const playerId = await waitForSubscriptionId();
        if (!playerId || playerId === lastSyncedId) return;

        const res = await PutRequest("/users/onesignal-subscription-id", {
          subscription_id: playerId,
        });

        if (res?.status === 200 || res?.status === 201) {
          lastSyncedId = playerId;
        }
      } catch (err) {
        console.error("Failed to sync OneSignal subscription", err);
      }
    };

    const setup = async () => {
      await initOneSignalSafely();
      if (!isActive) return;

      OneSignal.User.PushSubscription.addEventListener(
        "change",
        syncSubscription
      );
      await syncSubscription();
    };

    setup();

    return () => {
      isActive = false;
      OneSignal.User.PushSubscription.removeEventListener(
        "change",
        syncSubscription
      );
    };
  }, []);

  return null;
}
