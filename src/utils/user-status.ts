export type UserStatusDisplay = {
  emoji: string;
  text: string;
};

export function getUserStatus(
  user?: Record<string, unknown> | null,
  fallback?: Record<string, unknown> | null
): UserStatusDisplay | null {
  const emoji = String(
    user?.icon ??
      user?.status_icon ??
      user?.emoji ??
      fallback?.icon ??
      fallback?.status_icon ??
      fallback?.emoji ??
      ""
  ).trim();

  const text = String(
    user?.text ??
      user?.status_text ??
      fallback?.text ??
      fallback?.status_text ??
      ""
  ).trim();

  if (!emoji && !text) return null;

  return { emoji, text };
}

export function findOrgMemberForUser(
  orgMembers: unknown[] | null | undefined,
  user?: Record<string, unknown> | null
) {
  if (!user || !orgMembers?.length) return null;

  const userId = user.user_id ?? user.id ?? user.userid;
  if (userId == null) return null;

  return (
    orgMembers.find((member) => {
      if (!member || typeof member !== "object") return false;
      const record = member as Record<string, unknown>;
      return (
        String(record.id) === String(userId) ||
        String(record.user_id) === String(userId)
      );
    }) ?? null
  );
}
