export function isValidHHmm(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export function convertTo12Hour(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour.toString().padStart(2, "0")}:${m} ${suffix}`;
}

export function buildTimeRange(from: string, to: string): string | null {
  if (!isValidHHmm(from) || !isValidHHmm(to)) return null;
  return `${convertTo12Hour(from)} - ${convertTo12Hour(to)}`;
}

export function convertTo24Hour(time: string): string | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return null;
  let hour = Number(match[1]);
  const minutes = Number(match[2]);
  if (hour < 1 || hour > 12 || minutes > 59) return null;
  const suffix = match[3].toUpperCase();
  if (suffix === "PM" && hour !== 12) hour += 12;
  if (suffix === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${match[2]}`;
}

// Parses a stored "hh:mm AM - hh:mm PM" window. Returns null when the value is
// missing or malformed, so the page can fall back to the default window.
export function parseStoredTimeRange(
  value: unknown
): { from: string; to: string } | null {
  if (typeof value !== "string") return null;
  const parts = value.split(" - ");
  if (parts.length !== 2) return null;
  const from = convertTo24Hour(parts[0]);
  const to = convertTo24Hour(parts[1]);
  if (from === null || to === null) return null;
  return { from, to };
}
