"use client";

import React, { useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import {
  triggerLocalTestNotification,
  isTestNotificationEnabled,
  isNotificationsRoute,
} from "~/lib/notifications/notification-badge";
import { showSuccess, showInfo } from "~/components/toast/sonner";

export default function FloatingTestNotificationButton() {
  const pathname = usePathname();
  const { state } = useContext(DataContext);
  const badgeCount = state?.notificationBadgeState?.count ?? 0;
  const [pulsing, setPulsing] = useState(false);

  if (!isTestNotificationEnabled()) {
    return null;
  }

  const handleTrigger = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setPulsing(true);
    setTimeout(() => setPulsing(false), 600);

    const now = new Date().toISOString();
    const id = `test-${Date.now()}`;
    const notificationData = {
      id,
      notification_type: "new_message",
      title: "New Incoming Message",
      message: "You have received a new message in your cohort channel",
      isTest: true,
      created_at: now,
    };

    // Trigger test notification through the single centralized event dispatcher.
    // GeneralNotificationConnection handles the event, adds to notifications, and increments badge by exactly 1.
    triggerLocalTestNotification(notificationData);

    const onNotificationsPage = isNotificationsRoute(pathname);
    if (!onNotificationsPage) {
      showSuccess(
        "Test notification triggered!",
        `Badge count increased by 1 (Total: ${badgeCount + 1}). Check the sidebar bell icon.`
      );
    } else {
      showInfo(
        "Notification added to feed",
        "Badge count not incremented because you are currently on the notifications page."
      );
    }
  };

  return (
    <aside
      aria-label="Development test notification tool"
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 pointer-events-auto"
    >
      <button
        type="button"
        onClick={handleTrigger}
        className={`group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xl transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl active:scale-95 ${
          pulsing ? "ring-4 ring-blue-300 ring-offset-2" : ""
        }`}
        title="Click to trigger a test notification and test the unread badge counter"
      >
        <span className="relative flex items-center justify-center">
          <Bell className="h-4 w-4 transition-transform group-hover:rotate-12" />
          {badgeCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </span>
        <span>Trigger Test Notification</span>
      </button>
    </aside>
  );
}
