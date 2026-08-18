export const reloadCurrentPath = () => {
  if (typeof window === "undefined") return;

  window.location.replace(
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  );
};

export const redirectAfterOrgSwitch = (
  orgSlug: string,
  channelId?: string | null,
  options?: { preservePath?: boolean }
) => {
  if (options?.preservePath) {
    reloadCurrentPath();
    return;
  }

  const target = channelId
    ? `/${orgSlug}/home/channels/${channelId}`
    : `/${orgSlug}`;

  window.location.replace(target);
};

export const resolveChannelIdForOrgSwitch = async (
  fetchFirstChannel: (orgId?: string) => Promise<string | null | undefined>,
  orgId?: string,
  timeoutMs = 1000
): Promise<string | null> => {
  try {
    const channelId = await Promise.race([
      fetchFirstChannel(orgId),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);

    return channelId ?? null;
  } catch {
    return null;
  }
};
