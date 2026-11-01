import test from "node:test";
import assert from "node:assert/strict";
import {
  shouldIncrementNotificationBadge,
  registerNotificationBadge,
  clearNotificationBadgeRegistry,
  isNotificationsRoute,
  isHomeRoute,
  getNotificationBadgeKey,
} from "../src/lib/notifications/notification-badge.ts";
import {
  isNotificationRead,
  markNotificationAsRead,
  getReadNotificationIds,
  saveReadNotificationIds,
  getStorageKey,
} from "../src/lib/notifications/notification-store.ts";

test("isNotificationsRoute correctly identifies notification paths", () => {
  assert.equal(isNotificationsRoute("/my-org/notifications"), true);
  assert.equal(isNotificationsRoute("/my-org/notifications/"), true);
  assert.equal(isNotificationsRoute("/my-org/notifications/123"), true);
  assert.equal(isNotificationsRoute("/my-org/home"), false);
  assert.equal(isNotificationsRoute("/my-org/home/channels/123"), false);
  assert.equal(isNotificationsRoute(null), false);
  assert.equal(isNotificationsRoute(undefined), false);
});

test("isHomeRoute correctly identifies home paths", () => {
  assert.equal(isHomeRoute("/my-org/home"), true);
  assert.equal(isHomeRoute("/my-org/home/channels/123"), true);
  assert.equal(isHomeRoute("/my-org/notifications"), false);
});

test("shouldIncrementNotificationBadge accepts only valid notification types", () => {
  assert.equal(
    shouldIncrementNotificationBadge({ notification_type: "new_message" }),
    true
  );
  assert.equal(
    shouldIncrementNotificationBadge({ notification_type: "dm" }),
    true
  );
  assert.equal(
    shouldIncrementNotificationBadge({ notification_type: "mention" }),
    true
  );
  assert.equal(
    shouldIncrementNotificationBadge({ notification_type: "announcement" }),
    true
  );
  assert.equal(
    shouldIncrementNotificationBadge({
      notification_type: "direct_call_initiated",
    }),
    true
  );

  // Thread section
  assert.equal(
    shouldIncrementNotificationBadge({
      section: "thread_message",
      notification_type: "new_message",
    }),
    true
  );

  // Arbitrary payloads without valid notification_type must not increment
  assert.equal(
    shouldIncrementNotificationBadge({
      title: "Random Title",
      message: "Random text",
    }),
    false
  );
  assert.equal(
    shouldIncrementNotificationBadge({
      notification_type: "random_custom_event",
    }),
    false
  );
  assert.equal(shouldIncrementNotificationBadge(null), false);
  assert.equal(shouldIncrementNotificationBadge(undefined), false);
  assert.equal(shouldIncrementNotificationBadge({}), false);
});

test("registerNotificationBadge deduplicates repeated events", () => {
  clearNotificationBadgeRegistry();
  const payload = {
    notification_type: "new_message",
    channel_id: "chan-1",
    message_id: "msg-100",
    sender_id: "user-5",
  };
  assert.equal(registerNotificationBadge(payload), true);
  assert.equal(registerNotificationBadge(payload), false);

  clearNotificationBadgeRegistry();
  assert.equal(registerNotificationBadge(payload), true);
});

test("unread tracking store correctly identifies and marks read notifications", () => {
  // Mock localStorage in global scope for testing
  const mockStorage = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => mockStorage.get(key) || null,
      setItem: (key, val) => mockStorage.set(key, String(val)),
      removeItem: (key) => mockStorage.delete(key),
      clear: () => mockStorage.clear(),
    },
  };

  const userId = "test-user-1";
  const orgId = "test-org-1";

  const notif1 = { id: "notif-101", is_read: false };
  const notif2 = { id: "notif-102", is_read: false };

  // Initially both are unread
  assert.equal(isNotificationRead(notif1, userId, orgId), false);
  assert.equal(isNotificationRead(notif2, userId, orgId), false);

  // Mock dispatch
  const dispatched = [];
  const mockDispatch = (action) => dispatched.push(action);

  // Clicking an unread notification marks it as read and decrements
  const result1 = markNotificationAsRead(
    notif1.id,
    userId,
    orgId,
    mockDispatch
  );
  assert.equal(result1, true);
  assert.equal(dispatched.length, 1);
  assert.equal(dispatched[0].type, "DECREMENT_NOTIFICATION_BADGE");
  assert.equal(dispatched[0].payload, 1);
  assert.equal(isNotificationRead(notif1, userId, orgId), true);

  // Clicking the same notification again does NOT decrement badge
  const result2 = markNotificationAsRead(
    notif1.id,
    userId,
    orgId,
    mockDispatch
  );
  assert.equal(result2, false);
  assert.equal(dispatched.length, 1); // no new action dispatched!

  // notif2 is still unread
  assert.equal(isNotificationRead(notif2, userId, orgId), false);

  delete globalThis.window;
});
