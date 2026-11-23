import {
  getSharedCentrifuge,
  safeConnect,
} from "~/lib/centrifugo/shared-centrifuge";

/** Reconnect the shared Centrifugo client if it dropped while the tab slept. */
export function ensureCentrifugeConnected(): void {
  if (typeof window === "undefined") return;

  try {
    const client = getSharedCentrifuge();
    safeConnect(client);
  } catch {
    // Token / env may not be ready yet — ignore
  }
}
