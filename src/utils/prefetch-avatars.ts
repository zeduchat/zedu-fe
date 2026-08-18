type AvatarMessage = {
  avatar_url?: string;
  default_avatar_url?: string;
};

export function prefetchAvatars(messages: AvatarMessage[] | null | undefined) {
  if (typeof window === "undefined" || !messages?.length) return;

  const seen = new Set<string>();

  for (const message of messages) {
    const url = message.avatar_url || message.default_avatar_url;
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const img = new window.Image();
    img.decoding = "async";
    img.src = url;
  }
}
