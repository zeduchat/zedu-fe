import type {
  MessageSearchFilters,
  SearchDateFilter,
} from "~/lib/search/types";

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toQueryToken = (value: string): string => {
  const normalizedValue = value.trim();
  if (!normalizedValue) return "";

  const hasWhitespace = /\s/.test(normalizedValue);
  const escapedValue = normalizedValue.replace(/"/g, '\\"');

  return hasWhitespace ? `"${escapedValue}"` : escapedValue;
};

const appendDateFilter = (
  query: string,
  dateFilter: SearchDateFilter
): string => {
  const today = new Date();
  const todayDateStr = toLocalDateString(today);
  let nextQuery = query;

  switch (dateFilter.value) {
    case "today": {
      nextQuery += ` on:${todayDateStr}`;
      break;
    }
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      nextQuery += ` on:${toLocalDateString(yesterday)}`;
      break;
    }
    case "last_7_days": {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      nextQuery += ` after:${toLocalDateString(sevenDaysAgo)} before:${todayDateStr}`;
      break;
    }
    case "last_30_days": {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      nextQuery += ` after:${toLocalDateString(thirtyDaysAgo)} before:${todayDateStr}`;
      break;
    }
    case "last_12_months": {
      const twelveMonthsAgo = new Date(today);
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      nextQuery += ` after:${toLocalDateString(twelveMonthsAgo)} before:${todayDateStr}`;
      break;
    }
    default:
      break;
  }

  return nextQuery;
};

export const buildMessageSearchQuery = (
  baseQuery: string,
  filters: MessageSearchFilters = {},
  options?: { channelName?: string }
): string => {
  // Free-text search is case-insensitive; filter tokens keep their original casing.
  let query = baseQuery.trim().toLowerCase();

  if (options?.channelName) {
    query += ` in:${toQueryToken(options.channelName)}`;
  }

  if (filters.from) {
    const fromToken = toQueryToken(filters.from);
    if (fromToken) {
      query += ` from:${fromToken}`;
    }
  }

  if (filters.channel) {
    query += ` in:${toQueryToken(filters.channel)}`;
  }

  if (filters.date) {
    query = appendDateFilter(query, filters.date);
  }

  return query.trim();
};
