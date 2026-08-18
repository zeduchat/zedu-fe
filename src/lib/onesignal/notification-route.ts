const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const RESERVED_PATH_SEGMENTS = new Set([
  "auth",
  "accept_org_invitation",
  "accept_general_invitation",
  "billing",
  "about",
  "pricing",
  "resources",
  "policy",
  "download",
  "products",
  "solutions",
  "contact-sales",
  "terms-of-service",
  "account",
]);

export const normalizeNotificationPayload = (
  raw: Record<string, unknown> = {}
): Record<string, unknown> => {
  const nested = raw.payload;

  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return { ...raw, ...(nested as Record<string, unknown>) };
  }

  if (typeof nested === "string") {
    try {
      const parsed = JSON.parse(nested) as Record<string, unknown>;
      return { ...raw, ...parsed };
    } catch {
      return raw;
    }
  }

  return raw;
};

export const normalizeInternalPath = (value?: string | null): string | null => {
  if (!value) return null;

  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      const parsed = new URL(value);
      if (
        typeof window !== "undefined" &&
        parsed.origin !== window.location.origin
      ) {
        window.open(value, "_blank", "noopener,noreferrer");
        return null;
      }
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // fall through
  }

  return value.startsWith("/") ? value : `/${value}`;
};

export const getOrgSlugForNotification = (payloadOrgId?: unknown): string => {
  if (typeof window === "undefined") return "";

  const [firstSegment] = window.location.pathname.split("/").filter(Boolean);
  if (firstSegment && !RESERVED_PATH_SEGMENTS.has(firstSegment)) {
    return firstSegment;
  }

  const storedSlug = localStorage.getItem("orgSlug");
  if (storedSlug) return storedSlug;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.current_organisation_slug) return user.current_organisation_slug;

    if (Array.isArray(user?.organisations) && payloadOrgId) {
      const org = user.organisations.find(
        (item: { id?: string | number; slug?: string }) =>
          String(item?.id) === String(payloadOrgId)
      );
      if (org?.slug) return org.slug;
    }
  } catch {
    // ignore JSON parse failures
  }

  return "";
};

export const resolveNotificationRoute = (
  rawPayload: Record<string, unknown> = {},
  launchURL?: string | null,
  orgSlugOverride?: string | null
): string | null => {
  const data = normalizeNotificationPayload(rawPayload);
  const orgSlug =
    orgSlugOverride ||
    getString(data.org_slug) ||
    getOrgSlugForNotification(data.org_id);

  const directRoute =
    normalizeInternalPath(getString(data.route)) ||
    normalizeInternalPath(getString(data.path)) ||
    normalizeInternalPath(getString(data.url)) ||
    normalizeInternalPath(getString(data.redirect_url)) ||
    normalizeInternalPath(launchURL);

  if (directRoute) return directRoute;

  const channelId = getString(data.channel_id) || getString(data.channels_id);
  const participantId =
    getString(data.participant_id) || getString(data.sender_id);
  const notificationType = (
    getString(data.notification_type) || ""
  ).toLowerCase();
  const event = (getString(data.event) || "").toLowerCase();
  const section = (getString(data.section) || "").toLowerCase();
  const channelType = (getString(data.channel_type) || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  const buzzId = getString(data.buzz_id);

  if (!orgSlug) return null;

  const isGroupDm =
    notificationType === "groupdm" ||
    channelType === "groupdm" ||
    channelType === "groupdms";

  const isDmNotification =
    notificationType === "dm" ||
    section === "dm_channels_section" ||
    channelType === "dm" ||
    isGroupDm;

  const dmRoute = () => {
    if (!channelId) return null;
    if (isGroupDm || !participantId) {
      return `/${orgSlug}/dm/${channelId}/dms`;
    }
    return `/${orgSlug}/dm/${channelId}/${participantId}`;
  };

  const channelRoute = () => {
    if (!channelId) return null;
    return `/${orgSlug}/home/channels/${channelId}`;
  };

  if (isDmNotification && channelId) {
    return dmRoute() || `/${orgSlug}/notifications`;
  }

  if (section === "dm_channels_section" && channelId) {
    return dmRoute() || `/${orgSlug}/notifications`;
  }

  if (
    section === "thread_message" &&
    (event === "new_message" || notificationType === "new_message") &&
    channelId
  ) {
    return channelRoute() || `/${orgSlug}/notifications`;
  }

  if (section === "channels_section" && channelId) {
    return channelRoute() || `/${orgSlug}/notifications`;
  }

  if (notificationType === "channel" && channelId) {
    return channelRoute() || `/${orgSlug}/notifications`;
  }

  if (
    notificationType === "direct_call_initialized" ||
    notificationType === "direct_call_initiated" ||
    notificationType === "direct_call_response"
  ) {
    if (buzzId) return `/${orgSlug}/buzz/${buzzId}`;
    return dmRoute() || `/${orgSlug}/notifications`;
  }

  if (notificationType?.includes("buzz") && buzzId) {
    return `/${orgSlug}/buzz/${buzzId}`;
  }

  if (
    (event === "new_message" || notificationType === "new_message") &&
    channelId
  ) {
    return isDmNotification
      ? dmRoute() || `/${orgSlug}/notifications`
      : channelRoute() || `/${orgSlug}/notifications`;
  }

  if (channelId) {
    return channelRoute() || `/${orgSlug}/notifications`;
  }

  return `/${orgSlug}/notifications`;
};

export const storeMessageHighlightId = (
  rawPayload: Record<string, unknown> = {}
) => {
  if (typeof window === "undefined") return;

  const data = normalizeNotificationPayload(rawPayload);
  const messageId =
    getString(data.message_id) ||
    getString(data.messages_id) ||
    getString(data.thread_id);

  if (messageId) {
    localStorage.setItem("data-id", messageId);
  }
};
