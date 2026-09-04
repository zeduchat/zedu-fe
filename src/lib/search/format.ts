export function stripHtmlAndDecode(html: string): string {
  let text = html.replace(/<[^>]*>/g, "");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  return text.trim();
}

/**
 * Normalize API timestamps like "2026-08-14T08:26:30.229903316Z"
 * so Date parsing works across browsers (max 3 fractional second digits).
 */
export function parseSearchTimestamp(timestamp: string): Date | null {
  if (!timestamp) return null;

  const normalized = timestamp.trim().replace(/(\.\d{3})\d+(?=[Z+-]|$)/, "$1");

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatTimeOfDay(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Slack-style timestamps, e.g. "Yesterday at 5:45 PM", "Aug 14 at 8:26 AM".
 */
export function formatSearchTimestamp(timestamp: string): string {
  const date = parseSearchTimestamp(timestamp);
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMs >= 0 && diffMins < 1) return "Just now";
  if (diffMs >= 0 && diffMins < 60) {
    return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  }
  if (diffMs >= 0 && diffHours < 12) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const today = startOfLocalDay(now);
  const messageDay = startOfLocalDay(date);
  const dayDiff = Math.round(
    (today.getTime() - messageDay.getTime()) / 86400000
  );
  const time = formatTimeOfDay(date);

  if (dayDiff === 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Yesterday at ${time}`;

  const sameYear = date.getFullYear() === now.getFullYear();
  const dayLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });

  return `${dayLabel} at ${time}`;
}
