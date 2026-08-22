"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChannelExport, Pagination } from "~/types/channel";
import { GetRequest, PostRequest } from "~/utils/new-request";
import { showInfo, showSuccess } from "~/components/toast/sonner";

const HISTORY_PAGE_SIZE = 10;
const POLL_INTERVAL_MS = 3000;

const IN_PROGRESS_STATUSES = new Set([
  "pending",
  "processing",
  "in_progress",
  "in-progress",
  "queued",
  "started",
]);

const COMPLETED_STATUSES = new Set([
  "completed",
  "complete",
  "success",
  "ready",
]);

const FAILED_STATUSES = new Set(["failed", "error", "cancelled", "canceled"]);

export const isExportInProgress = (status?: string | null) =>
  IN_PROGRESS_STATUSES.has((status || "").toLowerCase());

export const isExportCompleted = (status?: string | null) =>
  COMPLETED_STATUSES.has((status || "").toLowerCase());

export const isExportFailed = (status?: string | null) =>
  FAILED_STATUSES.has((status || "").toLowerCase());

const ACCEPTED_STATUS_CODES = new Set([200, 201, 202]);

const isSuccess = (
  res: { status?: number; data?: { status_code?: number } } | null | undefined
) =>
  ACCEPTED_STATUS_CODES.has(res?.status ?? 0) ||
  ACCEPTED_STATUS_CODES.has(res?.data?.status_code ?? 0);

export const isExportAccepted = (
  res: { status?: number; data?: { status_code?: number } } | null | undefined
) => res?.status === 202 || res?.data?.status_code === 202;

const parsePagination = (raw: unknown): Pagination => {
  const source = Array.isArray(raw) ? raw[0] : raw;
  const page = (source || {}) as Record<string, number>;

  return {
    current_page: page.current_page || 1,
    page_size: page.page_size || HISTORY_PAGE_SIZE,
    total_items: page.total_items || 0,
    total_pages: page.total_pages || 1,
  };
};

export function getExportFilename(item: ChannelExport, channelName?: string) {
  if (item.file_url) {
    try {
      const name = new URL(item.file_url).pathname.split("/").pop();
      if (name) return decodeURIComponent(name);
    } catch {
      const fallback = item.file_url.split("?")[0].split("/").pop();
      if (fallback) return decodeURIComponent(fallback);
    }
  }

  const slug = (channelName || "channel")
    .replace(/^#/, "")
    .trim()
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  return `export_${slug || "channel"}.zip`;
}

export function useChannelExport(channelId: string | null, enabled: boolean) {
  const [currentExport, setCurrentExport] = useState<ChannelExport | null>(
    null
  );
  const [history, setHistory] = useState<ChannelExport[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    page_size: HISTORY_PAGE_SIZE,
    total_items: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const previousStatusRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchHistory = useCallback(
    async (page = 1) => {
      if (!channelId) {
        setHistory([]);
        return;
      }

      setHistoryLoading(true);
      try {
        const res = await GetRequest(
          `/channels/${channelId}/export/history?page=${page}&page_size=${HISTORY_PAGE_SIZE}`
        );

        if (isSuccess(res)) {
          const items = Array.isArray(res?.data?.data) ? res.data.data : [];
          setHistory(items);
          setPagination(parsePagination(res?.data?.pagination));
        } else {
          setHistory([]);
        }
      } finally {
        setHistoryLoading(false);
      }
    },
    [channelId]
  );

  const fetchStatus = useCallback(async () => {
    if (!channelId) {
      setCurrentExport(null);
      return null;
    }

    const res = await GetRequest(`/channels/${channelId}/export/status`);
    if (!isSuccess(res)) {
      setCurrentExport(null);
      previousStatusRef.current = null;
      return null;
    }

    const next = (res?.data?.data ?? null) as ChannelExport | null;
    const previousStatus = previousStatusRef.current;

    if (
      next &&
      isExportInProgress(previousStatus) &&
      isExportCompleted(next.status)
    ) {
      showSuccess("Your export is ready to download");
      fetchHistory(1);
    }

    if (
      next &&
      isExportInProgress(previousStatus) &&
      isExportFailed(next.status)
    ) {
      showInfo(next.error_message || "The export could not be completed");
      fetchHistory(1);
    }

    previousStatusRef.current = next?.status ?? null;
    setCurrentExport(next);
    return next;
  }, [channelId, fetchHistory]);

  const loadInitial = useCallback(async () => {
    if (!channelId) return;

    if (!hasLoadedRef.current) setLoading(true);
    try {
      await Promise.all([fetchStatus(), fetchHistory(1)]);
      hasLoadedRef.current = true;
    } finally {
      setLoading(false);
    }
  }, [channelId, fetchStatus, fetchHistory]);

  useEffect(() => {
    hasLoadedRef.current = false;
    previousStatusRef.current = null;
  }, [channelId]);

  useEffect(() => {
    if (!enabled || !channelId) return;
    loadInitial();
  }, [enabled, channelId, loadInitial]);

  useEffect(() => {
    if (!enabled || !isExportInProgress(currentExport?.status)) return;

    const timer = window.setInterval(() => {
      fetchStatus();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [enabled, currentExport?.status, fetchStatus]);

  const startExport = useCallback(async () => {
    if (!channelId || starting) return false;

    setStarting(true);
    try {
      const res = await PostRequest(`/channels/${channelId}/export`, {});
      if (!isSuccess(res)) return false;

      const next = (res?.data?.data ?? null) as ChannelExport | null;
      const message = res?.data?.message || "";

      previousStatusRef.current = next?.status ?? null;
      setCurrentExport(next);

      if (message.toLowerCase().includes("already")) {
        showInfo(message);
      } else if (isExportCompleted(next?.status)) {
        showSuccess(message || "Your export is ready to download");
      } else if (isExportAccepted(res) || isExportInProgress(next?.status)) {
        showInfo("We'll notify you when your export is ready to download");
      } else {
        showSuccess(message || "Export started");
      }

      fetchHistory(1);
      return true;
    } finally {
      setStarting(false);
    }
  }, [channelId, starting, fetchHistory]);

  return {
    currentExport,
    history,
    pagination,
    loading,
    historyLoading,
    starting,
    startExport,
    fetchHistory,
    fetchStatus,
  };
}
