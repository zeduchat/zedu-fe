"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChannelWebhook } from "~/types/webhook";
import {
  DeleteRequest,
  GetRequest,
  PostRequest,
  PutRequest,
} from "~/utils/new-request";
import { showSuccess } from "~/components/toast/sonner";

export function useChannelWebhook(channelId: string | null) {
  const [webhook, setWebhook] = useState<ChannelWebhook | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWebhook = useCallback(async () => {
    if (!channelId) {
      setWebhook(null);
      return;
    }

    setLoading(true);
    try {
      const res = await GetRequest(`/webhooks/${channelId}`);
      if (res?.status === 200 || res?.status === 201) {
        setWebhook(res?.data?.data ?? null);
      } else {
        setWebhook(null);
      }
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchWebhook();
  }, [fetchWebhook]);

  const createWebhook = async (payload?: {
    webhook_name?: string;
    event_name?: string;
  }) => {
    if (!channelId) return false;

    setActionLoading(true);
    try {
      const res = await PostRequest(`/webhooks/${channelId}`, payload ?? {});
      if (res?.status === 200 || res?.status === 201) {
        setWebhook(res?.data?.data ?? null);
        showSuccess(res?.data?.message || "Webhook created successfully");
        return true;
      }
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const changeStatus = async (webhookStatus: string) => {
    if (!channelId || !webhook?.id) return false;

    setActionLoading(true);
    try {
      const res = await PutRequest(
        `/webhooks/${channelId}/${webhook.id}/change-status`,
        { webhook_status: webhookStatus }
      );
      if (res?.status === 200 || res?.status === 201) {
        setWebhook(res?.data?.data ?? null);
        showSuccess(res?.data?.message || "Webhook status updated");
        return true;
      }
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteWebhook = async () => {
    if (!channelId || !webhook?.id) return false;

    setActionLoading(true);
    try {
      const res = await DeleteRequest(`/webhooks/${channelId}/${webhook.id}`);
      if (res?.status === 200 || res?.status === 201) {
        setWebhook(null);
        showSuccess(res?.data?.message || "Webhook deleted successfully");
        return true;
      }
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    webhook,
    loading,
    actionLoading,
    fetchWebhook,
    createWebhook,
    changeStatus,
    deleteWebhook,
  };
}
