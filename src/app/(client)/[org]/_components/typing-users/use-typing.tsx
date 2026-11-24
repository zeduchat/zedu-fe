import { useCallback, useContext, useRef } from "react";
import { safePublish } from "~/lib/centrifugo/shared-centrifuge";
import { DataContext } from "~/store/GlobalState";

const TYPING_THROTTLE_MS = 2000;

const UseTyping = (subscription: any) => {
  const { state } = useContext(DataContext);
  const lastStartRef = useRef(0);
  const subscriptionRef = useRef(subscription);
  const userRef = useRef(state?.user);

  subscriptionRef.current = subscription;
  userRef.current = state?.user;

  const publishTyping = (isTyping: boolean) => {
    const sub = subscriptionRef.current;
    const user = userRef.current;
    if (!sub || !user) return;

    safePublish(sub, {
      user: {
        id: user.user_id || user.id,
        username: user.username || user.name,
      },
      typing: isTyping,
      type: "typing",
    });
  };

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!isTyping) {
      lastStartRef.current = 0;
      publishTyping(false);
      return;
    }

    const now = Date.now();
    if (now - lastStartRef.current < TYPING_THROTTLE_MS) return;
    lastStartRef.current = now;
    publishTyping(true);
  }, []);

  return {
    handleTyping,
  };
};

export default UseTyping;
