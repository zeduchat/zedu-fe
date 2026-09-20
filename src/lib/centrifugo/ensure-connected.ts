import { getSharedCentrifuge } from "~/lib/centrifugo/shared-centrifuge";

/** Reconnect the shared Centrifugo client if it dropped while the tab slept. */
export function ensureCentrifugeConnected(): void {
  if (typeof window === "undefined") return;

  try {
    const client = getSharedCentrifuge();
    const state = client.state;
    if (state !== "connected" && state !== "connecting") {
      client.connect();
    }
  } catch {
    // Token / env may not be ready yet — ignore
  }
}
