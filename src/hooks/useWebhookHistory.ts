"use client";

import { useCallback, useEffect, useState } from "react";
import type { WebhookHistoryItem } from "~/types/webhook";
import { GetRequest } from "~/utils/new-request";

export function useWebhookHistory(
  channelId: string | null,
  webhookId: string | null | undefined
) {
  const [history, setHistory] = useState<WebhookHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!channelId || !webhookId) {
      setHistory([]);
      return;
    }

    setLoading(true);
    try {
      const res = await GetRequest(
        `/webhooks/${channelId}/history/${webhookId}`
      );
      if (res?.status === 200 || res?.status === 201) {
        setHistory(res?.data?.data?.webhooks_history ?? []);
      } else {
        setHistory([]);
      }
    } finally {
      setLoading(false);
    }
  }, [channelId, webhookId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, fetchHistory };
}
