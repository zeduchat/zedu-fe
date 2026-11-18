import { GetRequest } from "~/utils/new-request";
import { buildMessageSearchQuery } from "~/lib/search/query";
import type {
  MessageSearchFilters,
  MessageSearchPage,
  MessageSearchResult,
  SearchSortKey,
  UserSearchResult,
} from "~/lib/search/types";

type ApiPagination = {
  current_page?: unknown;
  total_pages_count?: unknown;
};

type ApiResponse = {
  status?: number;
  response?: { status?: number };
  data?: { data?: unknown; pagination?: ApiPagination };
};

/** Page size used when a caller does not ask for a specific limit. */
export const SEARCH_PAGE_SIZE = 20;

const SORT_KEYS: SearchSortKey[] = ["relevance", "newest", "oldest"];

/**
 * The search API reads `sortby` and validates it against relevance | newest |
 * oldest, answering 400 for anything else, so unknown values fall back to
 * relevance instead of breaking the whole search.
 */
export const normalizeSortKey = (sortBy?: string): SearchSortKey => {
  const normalized = (sortBy || "").trim().toLowerCase();
  return SORT_KEYS.find((key) => key === normalized) ?? "relevance";
};

const toPositiveInt = (value: number | undefined, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  const parsed = Math.floor(value);
  return parsed > 0 ? parsed : fallback;
};

export const getResponseStatus = (response: unknown): number | undefined => {
  const value = response as ApiResponse;
  return value?.status ?? value?.response?.status;
};

export const isSuccessResponse = (response: unknown): boolean => {
  const status = getResponseStatus(response);
  return status === 200 || status === 201;
};

const normalizeSearchResults = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

/**
 * Searches one page of an organisation's messages.
 *
 * The API paginates on the server (`page` and `limit`) and returns one page of
 * hits plus `pagination.total_pages_count`, so callers must request later pages
 * to reach matches beyond the first page.
 */
export async function searchMessagesPage(
  orgId: string,
  baseQuery: string,
  filters: MessageSearchFilters = {},
  options?: { channelName?: string; page?: number; limit?: number }
): Promise<MessageSearchPage> {
  const query = buildMessageSearchQuery(baseQuery, filters, {
    channelName: options?.channelName,
  });
  const page = toPositiveInt(options?.page, 1);
  const limit = toPositiveInt(options?.limit, SEARCH_PAGE_SIZE);

  if (!orgId || !query.trim()) {
    return { results: [], currentPage: page, totalPages: 0 };
  }

  const params = new URLSearchParams({
    query,
    sortby: normalizeSortKey(filters.sortBy),
    page: String(page),
    limit: String(limit),
  });

  const response = await GetRequest(
    `/search/organisation/${orgId}?${params.toString()}`
  );

  if (isSuccessResponse(response)) {
    const payload = response as ApiResponse;
    const results = normalizeSearchResults<MessageSearchResult>(
      payload.data?.data
    );
    const reportedPage = Number(payload.data?.pagination?.current_page);
    const reportedTotalPages = Number(
      payload.data?.pagination?.total_pages_count
    );

    return {
      results,
      currentPage:
        Number.isFinite(reportedPage) && reportedPage >= 1
          ? reportedPage
          : page,
      totalPages:
        Number.isFinite(reportedTotalPages) && reportedTotalPages >= 0
          ? reportedTotalPages
          : results.length > 0
            ? page
            : 0,
    };
  }

  const status = getResponseStatus(response);
  if (status === 404) {
    return { results: [], currentPage: page, totalPages: 0 };
  }

  throw response;
}

/** Searches the first page of an organisation's messages. */
export async function searchMessages(
  orgId: string,
  baseQuery: string,
  filters: MessageSearchFilters = {},
  options?: { channelName?: string; page?: number; limit?: number }
): Promise<MessageSearchResult[]> {
  const { results } = await searchMessagesPage(
    orgId,
    baseQuery,
    filters,
    options
  );
  return results;
}

export async function searchChannelMessages(
  channelId: string,
  query: string,
  sortBy: MessageSearchFilters["sortBy"] = "relevance"
): Promise<MessageSearchResult[]> {
  const trimmed = query.trim();
  if (!channelId || !trimmed) {
    return [];
  }

  const params = new URLSearchParams({
    query: trimmed,
    sortby: normalizeSortKey(sortBy),
  });

  const response = await GetRequest(
    `/search/channel/${channelId}?${params.toString()}`
  );

  if (isSuccessResponse(response)) {
    return normalizeSearchResults<MessageSearchResult>(
      (response as ApiResponse).data?.data
    );
  }

  const status = getResponseStatus(response);
  if (status === 404) {
    return [];
  }

  throw response;
}

export async function searchUsers(
  orgId: string,
  query: string
): Promise<UserSearchResult[]> {
  const trimmedQuery = query.trim().toLowerCase();

  if (!orgId || !trimmedQuery) {
    return [];
  }

  const params = new URLSearchParams({ query: trimmedQuery });
  const response = await GetRequest(
    `/organisations/${orgId}/users/search?${params.toString()}`
  );

  if (isSuccessResponse(response)) {
    return normalizeSearchResults<UserSearchResult>(
      (response as ApiResponse).data?.data
    );
  }

  const status = getResponseStatus(response);
  if (status === 404) {
    return [];
  }

  throw response;
}
