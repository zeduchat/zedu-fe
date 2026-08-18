import { format, isThisWeek, isToday, isYesterday } from "date-fns";

/** e.g. Today at 12:00pm, Yesterday at 11:26am, Tuesday at 3:44pm */
export function formatSlackStyleTimestamp(
  dateInput: string | Date | null | undefined
): string {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const time = format(date, "h:mma").toLowerCase();

  if (isToday(date)) return `Today at ${time}`;
  if (isYesterday(date)) return `Yesterday at ${time}`;
  if (isThisWeek(date, { weekStartsOn: 0 })) {
    return `${format(date, "EEEE")} at ${time}`;
  }

  return `${format(date, "MMM d, yyyy")} at ${time}`;
}
