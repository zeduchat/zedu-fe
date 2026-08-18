import { showError } from "~/components/toast/sonner";

export type OpenBuzzOptions = {
  /** Skip green room and join the meeting immediately (incoming call accept). */
  directJoin?: boolean;
};

export const getBuzzDetailsPath = (
  orgSlug: string,
  buzzId: string,
  options?: OpenBuzzOptions
) => {
  const path = `/${orgSlug}/buzz/${buzzId}`;
  if (options?.directJoin) {
    return `${path}?direct=1`;
  }
  return path;
};

export const prepareBuzzTab = () => {
  if (typeof window === "undefined") return null;

  const tab = window.open("about:blank", "_blank");

  if (!tab) {
    showError(
      "Pop-up blocked. Please allow pop-ups to open the buzz in a new tab."
    );
  }

  return tab;
};

export const navigateBuzzTab = (
  tab: Window | null,
  orgSlug: string,
  buzzId: string,
  options?: OpenBuzzOptions
) => {
  const url = getBuzzDetailsPath(orgSlug, buzzId, options);

  if (tab && !tab.closed) {
    tab.location.href = url;
    tab.focus();
    return true;
  }

  return openBuzzInNewTab(orgSlug, buzzId, options);
};

export const openBuzzInNewTab = (
  orgSlug: string,
  buzzId: string,
  options?: OpenBuzzOptions
) => {
  if (typeof window === "undefined") return false;

  const url = getBuzzDetailsPath(orgSlug, buzzId, options);
  const tab = window.open(url, "_blank", "noopener,noreferrer");

  if (!tab) {
    showError(
      "Pop-up blocked. Please allow pop-ups to open the buzz in a new tab."
    );
    return false;
  }

  tab.focus();
  return true;
};
