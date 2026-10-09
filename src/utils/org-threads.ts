import type { ThreadGroup, ThreadsPagination } from "~/types/threads";
import { GetRequest } from "~/utils/new-request";

export const ORGANISATION_THREADS_PAGE_LIMIT = 50;

export type LoadOrganisationThreadsResult = {
  success: boolean;
  threads: ThreadGroup[];
  hasMore: boolean;
  unseenThreadCount: number;
};

type OrganisationThreadsData = {
  unseen_thread_count?: number;
  threads?: ThreadGroup[];
};

export function parseOrganisationThreadsResponse(res: {
  data?: {
    data?: ThreadGroup[] | OrganisationThreadsData;
    pagination?: ThreadsPagination;
  };
}): {
  threads: ThreadGroup[];
  unseenThreadCount: number;
  pagination?: ThreadsPagination;
} {
  const payload = res?.data?.data;

  if (Array.isArray(payload)) {
    return {
      threads: payload,
      unseenThreadCount: 0,
      pagination: res?.data?.pagination,
    };
  }

  if (payload && typeof payload === "object") {
    const threads = Array.isArray(payload.threads) ? payload.threads : [];
    const unseenThreadCount =
      typeof payload.unseen_thread_count === "number"
        ? payload.unseen_thread_count
        : 0;

    return {
      threads,
      unseenThreadCount,
      pagination: res?.data?.pagination,
    };
  }

  return {
    threads: [],
    unseenThreadCount: 0,
    pagination: res?.data?.pagination,
  };
}

export function organisationThreadsHasMore(
  threads: ThreadGroup[],
  pagination?: ThreadsPagination
): boolean {
  if (threads.length === 0) return false;

  const currentPage = Number(pagination?.current_page) || 1;
  const totalPages = Number(pagination?.total_pages_count) || 0;

  if (totalPages > currentPage) return true;

  const pageCount = Number(pagination?.page_count) || 0;
  if (pageCount > currentPage && pageCount !== threads.length) return true;

  return threads.length >= ORGANISATION_THREADS_PAGE_LIMIT;
}

export async function loadOrganisationThreadsPage(
  orgId: string,
  page: number
): Promise<LoadOrganisationThreadsResult> {
  if (!orgId) {
    return {
      success: false,
      threads: [],
      hasMore: false,
      unseenThreadCount: 0,
    };
  }

  try {
    const res = await GetRequest(
      `/threads/organisations/${orgId}?page=${page}&limit=${ORGANISATION_THREADS_PAGE_LIMIT}`
    );

    if (res?.status === 200 || res?.status === 201) {
      const { threads, unseenThreadCount, pagination } =
        parseOrganisationThreadsResponse(res);
      const hasMore = organisationThreadsHasMore(threads, pagination);

      return { success: true, threads, hasMore, unseenThreadCount };
    }
  } catch (error) {
    console.error("Error fetching organisation threads:", error);
  }

  return { success: false, threads: [], hasMore: false, unseenThreadCount: 0 };
}

export function getThreadGroupChannelLink(
  orgSlug: string,
  group: ThreadGroup
): { href: string; isPrivate: boolean } | null {
  const root = group.thread_messages?.[0];
  const channelId = root?.channels_id;
  if (!channelId || !orgSlug) return null;

  const channelType = (
    group.channel_type ??
    root?.channel_type ??
    "public"
  ).toLowerCase();

  if (channelType === "groupdm") {
    return {
      href: `/${orgSlug}/home/people/${channelId}/dms`,
      isPrivate: true,
    };
  }

  if (channelType === "dm") {
    return null;
  }

  const isPrivate = channelType === "private";
  return {
    href: `/${orgSlug}/home/channels/${channelId}`,
    isPrivate,
  };
}
