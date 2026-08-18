"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PageVisitsWebhook } from "~/utils/webhook-request";

const TWO_HOURS = 2 * 60 * 60 * 1000;

const getVisitorId = (): string => {
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }
  return id;
};

const getLastVisit = (): number | null => {
  const value = localStorage.getItem("last_visit_time");
  return value ? parseInt(value, 10) : null;
};

const setLastVisit = (time: number) => {
  localStorage.setItem("last_visit_time", time.toString());
};

export const useVisitTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const visitorId = getVisitorId();
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        const username = user?.username || user?.email || `guest_${visitorId}`;
        const now = Date.now();
        const lastVisit = getLastVisit();
        const fullVisitAllowed = !lastVisit || now - lastVisit > TWO_HOURS;

        const event_name = fullVisitAllowed ? "visit" : "page_view";
        const status = "success";

        // Collect extended metadata
        const ip = await fetch("https://api.ipify.org?format=json")
          .then((res) => res.json())
          .then((data) => data.ip)
          .catch(() => "unknown");

        const message = `
                    🔹 URL: ${window.location.href}\\n
                    🔹 Path: ${pathname}\\n
                    🔹 Username: ${username}\\n
                    🔹 Browser: ${navigator.userAgent}\\n
                    🔹 Referrer: ${document.referrer || "Direct visit"}\\n
                    🔹 IP: ${ip}\\n
                    🔹 Visitor ID: ${visitorId}\\n
                    `;

        await PageVisitsWebhook(username, event_name, message.trim(), status);

        if (fullVisitAllowed) setLastVisit(now);
      } catch (err) {
        console.error("Visit tracking failed:", err);
      }
    };

    trackVisit();
  }, [pathname]);
};
