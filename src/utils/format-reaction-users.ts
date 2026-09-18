/** Max names shown before Slack-style "and X others". */
const MAX_REACTION_NAMES = 11;

/**
 * Formats reaction usernames like Slack:
 * - "Alice"
 * - "Alice and Bob"
 * - "Alice, Bob and Carol"
 * - "Alice, Bob, … and 5 others" when over the cap
 */
export function formatReactionUsers(
  names: string[],
  maxNames = MAX_REACTION_NAMES
): string {
  const displayNames = (names || []).filter(Boolean);
  if (displayNames.length === 0) return "";
  if (displayNames.length === 1) return displayNames[0];

  if (displayNames.length > maxNames) {
    const shown = displayNames.slice(0, maxNames).join(", ");
    const others = displayNames.length - maxNames;
    return `${shown} and ${others} other${others === 1 ? "" : "s"}`;
  }

  const last = displayNames[displayNames.length - 1];
  const rest = displayNames.slice(0, -1).join(", ");
  return `${rest} and ${last}`;
}
