import { useState, useEffect } from "react";

export const useNotificationStatus = () => {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [browser, setBrowser] = useState<"chrome" | "safari" | "other">(
    "other"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("safari") && !ua.includes("chrome")) setBrowser("safari");
    else if (ua.includes("chrome")) setBrowser("chrome");

    setPermission(window.Notification.permission);

    const interval = setInterval(() => {
      if (
        window.Notification &&
        window.Notification.permission !== permission
      ) {
        setPermission(window.Notification.permission);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [permission]);

  return { permission, browser };
};
