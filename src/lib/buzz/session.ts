export const RECORDER_SESSION_MODE = "recorder";

export function isRecorderSessionMode(mode?: string | null) {
  return mode === RECORDER_SESSION_MODE;
}

export function isRecorderParticipant(participant: unknown) {
  if (!participant || typeof participant !== "object") return false;

  const value = participant as {
    role?: string;
    mode?: string;
    is_recorder?: boolean;
  };

  return (
    value.role === RECORDER_SESSION_MODE ||
    value.mode === RECORDER_SESSION_MODE ||
    value.is_recorder === true
  );
}

export function filterVisibleParticipants<T>(participants?: T[] | null) {
  return (participants || []).filter(
    (participant) => !isRecorderParticipant(participant)
  );
}

export function isRecorderRoute(pathname: string) {
  return pathname.includes("/buzz-record/");
}

export function isBuzzDetailsRoute(pathname: string) {
  return /\/buzz\/[^/]+$/.test(pathname);
}

export function isStandaloneBuzzRoute(pathname: string) {
  return isBuzzDetailsRoute(pathname) || isRecorderRoute(pathname);
}

export function hydrateRecorderSessionFromSearchParams(
  searchParams: URLSearchParams
) {
  const token = searchParams.get("token");
  const orgId = searchParams.get("orgId");
  const mode = searchParams.get("mode") || searchParams.get("role");

  if (token) {
    localStorage.setItem("token", token);
  }

  if (orgId) {
    localStorage.setItem("orgId", orgId);
  }

  return {
    token,
    orgId,
    mode,
    isRecorder: isRecorderSessionMode(mode),
  };
}
