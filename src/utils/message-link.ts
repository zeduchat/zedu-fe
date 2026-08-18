export type MessageLinkContext = "channel" | "dm";

export type ParsedMessageLink = {
  orgSlug: string;
  channelId: string;
  threadId: string;
  messageId?: string;
  context: MessageLinkContext;
};

const getAppOrigin = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_CLIENT_URL || "";
};

export function buildMessageLink({
  orgSlug,
  channelId,
  threadId,
  messageId,
  context,
}: {
  orgSlug: string;
  channelId: string;
  threadId: string;
  messageId?: string;
  context: MessageLinkContext;
}) {
  const params = new URLSearchParams();
  params.set("thread_id", threadId);
  if (messageId) {
    params.set("message_id", messageId);
  }

  const query = params.toString();
  const origin = getAppOrigin();

  if (context === "dm") {
    return `${origin}/${orgSlug}/dms/${channelId}?${query}`;
  }

  return `${origin}/${orgSlug}/home/channels/${channelId}?${query}`;
}

export function parseMessageLink(url: string): ParsedMessageLink | null {
  try {
    const parsed = new URL(url, getAppOrigin());
    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts.length < 3) return null;

    const orgSlug = parts[0];
    const threadId = parsed.searchParams.get("thread_id");
    if (!threadId) return null;

    const messageId = parsed.searchParams.get("message_id") || undefined;

    if (parts[1] === "dms" && parts[2]) {
      return {
        orgSlug,
        channelId: parts[2],
        threadId,
        messageId,
        context: "dm",
      };
    }

    if (parts[1] === "home" && parts[2] === "channels" && parts[3]) {
      return {
        orgSlug,
        channelId: parts[3],
        threadId,
        messageId,
        context: "channel",
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function getMessageLinkContext(pathname: string): MessageLinkContext {
  if (
    pathname.includes("/dm/") ||
    (pathname.includes("/people/") && pathname.includes("/dm"))
  ) {
    return "dm";
  }

  return "channel";
}
