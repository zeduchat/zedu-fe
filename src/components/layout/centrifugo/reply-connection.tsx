"use client";
import { useContext, useEffect } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { usePathname } from "next/navigation";
import {
  getSharedCentrifuge,
  getSubscriptionToken,
  prepareChannelSubscription,
  releaseChannelSubscription,
} from "~/lib/centrifugo/shared-centrifuge";

/** eslint-disable */

//

export default function ReplyConnection() {
  const { state, dispatch } = useContext(DataContext);
  const pathname = usePathname();
  const isThreadsPage = pathname?.includes("/threads");

  // centrifugo connection for notification
  useEffect(() => {
    const threadId = state?.thread?.thread_id;
    if (!threadId) return;

    const centrifugeClient = getSharedCentrifuge();
    const sub = prepareChannelSubscription(centrifugeClient, threadId, {
      getToken: () => getSubscriptionToken(threadId),
    });

    const onSubscribed = () => {
      dispatch({ type: ACTIONS.REPLY_SUBSCRIPTION, payload: sub });
    };

    const onPublication = (ctx: any) => {
      if (ctx?.data?.type === "message") {
        dispatch({
          type: ACTIONS.REPLIES,
          payload: { newMessage: ctx.data, isRealTime: true },
        });
      }
    };

    const onError = (ctx: any) => {
      console.error(`Subscription error: ${ctx.message}`);
    };

    sub.on("subscribed", onSubscribed);
    sub.on("publication", onPublication);
    sub.on("error", onError);

    if (sub.state !== "subscribed") {
      sub.subscribe();
    } else {
      dispatch({ type: ACTIONS.REPLY_SUBSCRIPTION, payload: sub });
    }

    return () => {
      sub.off("subscribed", onSubscribed);
      sub.off("publication", onPublication);
      sub.off("error", onError);
      releaseChannelSubscription(centrifugeClient, threadId, sub);
      dispatch({ type: ACTIONS.REPLY_SUBSCRIPTION, payload: null });
    };
  }, [dispatch, state?.thread?.thread_id]);

  // Threads page has no channel/DM connection — subscribe to the channel for reply reactions.
  useEffect(() => {
    const channelId = state?.thread?.channels_id;
    if (!isThreadsPage || !channelId) return;

    const centrifugeClient = getSharedCentrifuge();
    const sub = prepareChannelSubscription(centrifugeClient, channelId, {
      getToken: () => getSubscriptionToken(channelId),
    });

    const onPublication = (ctx: any) => {
      const result = ctx?.data;

      if (
        result?.section === "reply_message" &&
        result?.notification_type === "reaction_event"
      ) {
        const ids = ctx?.data?.modification_ids;
        const reactions = ctx?.data?.reactions;

        dispatch({
          type: ACTIONS.UPDATE_REPLY_REACTIONS,
          payload: {
            messageId: ids.message_id,
            reactions,
          },
        });
      }
    };

    const onError = (ctx: any) => {
      console.error(`Subscription error: ${ctx.message}`);
    };

    sub.on("publication", onPublication);
    sub.on("error", onError);

    if (sub.state !== "subscribed") {
      sub.subscribe();
    }

    return () => {
      sub.off("publication", onPublication);
      sub.off("error", onError);
      releaseChannelSubscription(centrifugeClient, channelId, sub);
    };
  }, [dispatch, isThreadsPage, state?.thread?.channels_id]);

  //

  return <></>;
}
