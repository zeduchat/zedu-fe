import { GetRequest } from "~/utils/new-request";
import { buildMessageSearchQuery } from "~/lib/search/query";
import type {
  MessageSearchFilters,
  MessageSearchResult,
  UserSearchResult,
} from "~/lib/search/types";

type ApiResponse = {
  status?: number;
  response?: { status?: number };
  data?: { data?: unknown };
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

export async function searchMessages(
  orgId: string,
  baseQuery: string,
  filters: MessageSearchFilters = {},
  options?: { channelName?: string }
): Promise<MessageSearchResult[]> {
  const query = buildMessageSearchQuery(baseQuery, filters, options);

  if (!orgId || !query.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    query,
    sortBy: filters.sortBy || "relevance",
  });

  const response = await GetRequest(
    `/search/organisation/${orgId}?${params.toString()}`
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
