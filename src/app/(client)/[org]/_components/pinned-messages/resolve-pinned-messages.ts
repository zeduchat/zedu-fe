import { GetRequest } from "~/utils/new-request";

export type PinScope = "channel" | "chat";

export type PinRecord = {
  id: string;
  pinnedAt: string;
  embedded: Record<string, any> | null;
};

export type ResolvedPin = {
  pinId: string;
  pinnedAt: string;
  message: Record<string, any> | null;
};

const CHANNEL_PAGE_SIZE = 80;
const CHAT_PAGE_SIZE = 50;
const MAX_PAGES = 4;

const isSuccess = (res: { status?: number } | null | undefined) =>
  res?.status === 200 || res?.status === 201;

const embeddedMessage = (record: Record<string, any>) => {
  if (typeof record.message === "string") return record;

  const nested = record.thread;
  if (
    nested &&
    typeof nested === "object" &&
    typeof nested.message === "string"
  ) {
    return nested as Record<string, any>;
  }

  return null;
};

export function normalizePins(data: unknown): PinRecord[] {
  if (!Array.isArray(data)) return [];

  return data.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const record = item as Record<string, any>;
    const id = String(record.id || record.thread_id || record.message_id || "");
    if (!id) return [];

    return [
      {
        id,
        pinnedAt: String(record.pinned_at || ""),
        embedded: embeddedMessage(record),
      },
    ];
  });
}

const remember = (map: Map<string, any>, item: any) => {
  if (!item || typeof item !== "object") return;

  const keys = [item.thread_id, item.id].filter(Boolean).map(String);
  keys.forEach((key) => {
    if (!map.has(key)) map.set(key, item);
  });
};

const readPage = async (url: string) => {
  const res = await GetRequest(url);
  if (!isSuccess(res)) return null;
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fillSource = async (
  map: Map<string, any>,
  records: PinRecord[],
  urlForPage: (page: number) => string,
  pageSize: number
) => {
  const missing = () => records.some((pin) => !map.has(pin.id));

  for (let page = 1; page <= MAX_PAGES && missing(); page += 1) {
    const batch = await readPage(urlForPage(page));
    if (!batch || batch.length === 0) return;

    batch.forEach((item: any) => remember(map, item));

    if (batch.length < pageSize) return;
  }
};

export async function resolvePinnedMessages({
  records,
  knownMessages,
  scope,
  channelId,
}: {
  records: PinRecord[];
  knownMessages: any[];
  scope: PinScope;
  channelId: string;
}): Promise<ResolvedPin[]> {
  const map = new Map<string, any>();

  knownMessages.forEach((item) => remember(map, item));

  records.forEach((pin) => {
    if (!pin.embedded || map.has(pin.id)) return;
    remember(map, pin.embedded);
    map.set(pin.id, pin.embedded);
  });

  const missing = () => records.some((pin) => !map.has(pin.id));

  if (missing()) {
    if (scope === "channel") {
      await fillSource(
        map,
        records,
        (page) =>
          `/threads/channels/${channelId}?page=${page}&limit=${CHANNEL_PAGE_SIZE}`,
        CHANNEL_PAGE_SIZE
      );
    } else {
      await fillSource(
        map,
        records,
        (page) =>
          `/dms/channels/${channelId}/threads?page=${page}&limit=${CHAT_PAGE_SIZE}`,
        CHAT_PAGE_SIZE
      );

      if (missing()) {
        await fillSource(
          map,
          records,
          (page) =>
            `/group-dms/channels/${channelId}/threads?page=${page}&limit=${CHAT_PAGE_SIZE}`,
          CHAT_PAGE_SIZE
        );
      }
    }
  }

  return records.map((pin) => ({
    pinId: pin.id,
    pinnedAt: pin.pinnedAt,
    message: map.get(pin.id) || null,
  }));
}

export function pinKind(message: Record<string, any> | null, pinId: string) {
  const threadId = message?.thread_id ? String(message.thread_id) : "";
  const messageId = message?.id ? String(message.id) : "";

  if (messageId && messageId === pinId && threadId && threadId !== messageId) {
    return { kind: "message" as const, id: messageId, threadId };
  }

  return {
    kind: "thread" as const,
    id: threadId || pinId,
    threadId: threadId || pinId,
  };
}
