/** Client-side member filter (same member pool as @mentions in the editor). */
export const getMemberId = (member: {
  id?: string | number;
  user_id?: string | number;
  profile?: { user_id?: string | number };
}) => String(member?.id ?? member?.user_id ?? member?.profile?.user_id ?? "");

export function filterOrgMembers<T extends Record<string, unknown>>(
  members: T[],
  query: string,
  excludeIds: Set<string> = new Set()
): T[] {
  const q = query.trim().toLowerCase();

  return members.filter((member) => {
    const id = getMemberId(member as Parameters<typeof getMemberId>[0]);
    if (!id || excludeIds.has(id)) return false;
    if (!q) return true;

    const profile = member.profile as
      | {
          full_name?: string;
          display_name?: string;
          email?: string;
          username?: string;
        }
      | undefined;
    const haystack = [
      member.name,
      member.username,
      member.email,
      profile?.full_name,
      profile?.display_name,
      profile?.email,
      profile?.username,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function toNewChatUser(member: Record<string, unknown>): {
  id: string;
  name: string;
  username: string;
  profile_url: string;
  avatar_url: string;
  default_avatar_url: string;
} {
  const id = getMemberId(member as Parameters<typeof getMemberId>[0]);
  const profile = member.profile as
    | {
        avatar_url?: string;
        full_name?: string;
        display_name?: string;
        username?: string;
      }
    | undefined;

  return {
    id,
    name: String(
      member.name ||
        profile?.full_name ||
        profile?.display_name ||
        member.username ||
        ""
    ),
    username: String(member.username || profile?.username || ""),
    profile_url: String(
      member.profile_url || member.avatar_url || profile?.avatar_url || ""
    ),
    avatar_url: String(
      member.avatar_url || member.profile_url || profile?.avatar_url || ""
    ),
    default_avatar_url: String(member.default_avatar_url || ""),
  };
}
