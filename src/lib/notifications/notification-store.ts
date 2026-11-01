const ACTIONS = {
  INCREMENT_NOTIFICATION_BADGE: "INCREMENT_NOTIFICATION_BADGE",
  DECREMENT_NOTIFICATION_BADGE: "DECREMENT_NOTIFICATION_BADGE",
  SET_NOTIFICATION_BADGE: "SET_NOTIFICATION_BADGE",
  CLEAR_NOTIFICATION_BADGE: "CLEAR_NOTIFICATION_BADGE",
} as const;

const MAX_STORED_IDS = 500;

export const getStorageKey = (
  userId?: string | null,
  orgId?: string | null
): string => {
  const u = userId || "default";
  const o = orgId || "default";
  return `zedu_read_notifications_${u}_${o}`;
};

export const getReadNotificationIds = (
  userId?: string | null,
  orgId?: string | null
): Set<string> => {
  if (typeof window === "undefined" || !window.localStorage) return new Set();
  try {
    const raw = window.localStorage.getItem(getStorageKey(userId, orgId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
};

export const saveReadNotificationIds = (
  ids: Set<string>,
  userId?: string | null,
  orgId?: string | null
): void => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const array = Array.from(ids).slice(-MAX_STORED_IDS);
    window.localStorage.setItem(
      getStorageKey(userId, orgId),
      JSON.stringify(array)
    );
  } catch (error) {
    console.error("Failed to persist read notification ids", error);
  }
};

export const isNotificationRead = (
  item: any,
  userId?: string | null,
  orgId?: string | null
): boolean => {
  if (!item) return true;
  if (typeof item === "string" || typeof item === "number") {
    return getReadNotificationIds(userId, orgId).has(String(item));
  }
  if (item.is_read === true || item.read === true || item.status === "read") {
    return true;
  }
  const id = item.id || item.message_id || item.messages_id;
  if (!id) return false;
  return getReadNotificationIds(userId, orgId).has(String(id));
};

export const markNotificationAsRead = (
  id: string | number,
  userId?: string | null,
  orgId?: string | null,
  dispatch?: (action: { type: string; payload?: any }) => void
): boolean => {
  if (!id) return false;
  const strId = String(id);
  const readIds = getReadNotificationIds(userId, orgId);
  if (!readIds.has(strId)) {
    readIds.add(strId);
    saveReadNotificationIds(readIds, userId, orgId);
    if (dispatch) {
      dispatch({ type: ACTIONS.DECREMENT_NOTIFICATION_BADGE, payload: 1 });
    }
    return true;
  }
  return false;
};

export const markAllNotificationsAsRead = (
  ids: (string | number)[],
  userId?: string | null,
  orgId?: string | null,
  dispatch?: (action: { type: string; payload?: any }) => void
): void => {
  const readIds = getReadNotificationIds(userId, orgId);
  for (const id of ids) {
    if (id) readIds.add(String(id));
  }
  saveReadNotificationIds(readIds, userId, orgId);
  if (dispatch) {
    dispatch({ type: ACTIONS.CLEAR_NOTIFICATION_BADGE });
  }
};

export const fetchAndSyncUnreadBadge = async (
  orgId: string,
  userId?: string | null,
  dispatch?: (action: { type: string; payload?: any }) => void,
  customGetRequest?: (url: string) => Promise<any>
): Promise<number> => {
  if (!orgId || !dispatch) return 0;
  try {
    let fetcher = customGetRequest;
    if (!fetcher) {
      const { GetRequest } = await import("~/utils/new-request");
      fetcher = GetRequest;
    }
    const res = await fetcher(
      `/organisations/${orgId}/users/onesignal?page=1&limit=20`
    );
    if (res?.status === 200 || res?.status === 201) {
      const items = res?.data?.data?.notifications || [];
      const unreadCount = items.filter(
        (item: any) => !isNotificationRead(item, userId, orgId)
      ).length;
      dispatch({
        type: ACTIONS.SET_NOTIFICATION_BADGE,
        payload: unreadCount,
      });
      return unreadCount;
    }
  } catch (error) {
    console.error("Failed to fetch unread notifications count", error);
  }
  return 0;
};
