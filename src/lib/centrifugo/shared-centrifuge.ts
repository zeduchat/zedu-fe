import axios from "axios";
import {
  Centrifuge,
  type Subscription,
  type SubscriptionOptions,
} from "centrifuge";

const connectUrl = process.env.NEXT_PUBLIC_CONNECT_URL as string;

let sharedClient: Centrifuge | null = null;
const subscriptionRefCounts = new Map<string, number>();

const BENIGN_SUBSCRIBE_CODES = new Set([1, 7]);

const logCentrifugoError = (label: string, err: unknown) => {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? Number((err as { code: number }).code)
      : undefined;
  if (code !== undefined && BENIGN_SUBSCRIBE_CODES.has(code)) {
    return;
  }
  console.warn(`[Centrifugo] ${label} failed`, err);
};

const absorbPromise = (result: unknown, label: string) => {
  if (
    result &&
    typeof result === "object" &&
    "catch" in result &&
    typeof (result as Promise<unknown>).catch === "function"
  ) {
    void (result as Promise<unknown>).catch((err) =>
      logCentrifugoError(label, err)
    );
  }
};

export function safeSubscribe(sub: Subscription): void {
  if (sub.state === "subscribed" || sub.state === "subscribing") {
    return;
  }

  try {
    absorbPromise(sub.subscribe(), "subscribe");
  } catch (err) {
    logCentrifugoError("subscribe", err);
  }
}

export function safeConnect(client: Centrifuge): void {
  const state = client.state;
  if (state === "connected" || state === "connecting") {
    return;
  }
  try {
    absorbPromise(client.connect(), "connect");
  } catch (err) {
    logCentrifugoError("connect", err);
  }
}

export async function getConnectionToken(): Promise<string> {
  const token = localStorage.getItem("token") || "";
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_URL}/token/connection`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.data.token;
}

export async function getSubscriptionToken(channel: string): Promise<string> {
  const token = localStorage.getItem("token") || "";

  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}/token/subscription`,
    { channel },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data.token;
}

export function getSharedCentrifuge(): Centrifuge {
  if (!sharedClient) {
    sharedClient = new Centrifuge(connectUrl, {
      getToken: getConnectionToken,
      debug: process.env.NODE_ENV === "development",
      timeout: 10_000,
    });
    safeConnect(sharedClient);
  }

  return sharedClient;
}

export function prepareChannelSubscription(
  client: Centrifuge,
  channel: string,
  options: SubscriptionOptions
): Subscription {
  const existingSubscription = client.getSubscription(channel);
  if (existingSubscription) {
    subscriptionRefCounts.set(
      channel,
      (subscriptionRefCounts.get(channel) ?? 0) + 1
    );
    return existingSubscription;
  }

  const sub = client.newSubscription(channel, options);
  subscriptionRefCounts.set(channel, 1);
  return sub;
}

export function releaseChannelSubscription(
  client: Centrifuge,
  channel: string,
  sub: Subscription
): void {
  const nextCount = (subscriptionRefCounts.get(channel) ?? 1) - 1;

  if (nextCount <= 0) {
    subscriptionRefCounts.delete(channel);
    if (sub.state !== "unsubscribed") {
      try {
        sub.unsubscribe();
      } catch {
        // ignore teardown races
      }
    }
    try {
      client.removeSubscription(sub);
    } catch {
      // ignore if already removed
    }
    return;
  }

  subscriptionRefCounts.set(channel, nextCount);
}

export function resetSharedCentrifuge(): void {
  if (!sharedClient) return;

  sharedClient.disconnect();
  sharedClient = null;
  subscriptionRefCounts.clear();
}
