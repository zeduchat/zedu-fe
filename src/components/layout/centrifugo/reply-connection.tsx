"use client";
import { useContext, useEffect } from "react";
import { DataContext } from "~/store/GlobalState";
import axios from "axios";
import { Centrifuge } from "centrifuge";
import { ACTIONS } from "~/store/Actions";
import { usePathname } from "next/navigation";

/** eslint-disable */

//

export default function ReplyConnection() {
  const { state, dispatch } = useContext(DataContext);
  const pathname = usePathname();
  const isThreadsPage = pathname?.includes("/threads");

  const connectUrl: any = process.env.NEXT_PUBLIC_CONNECT_URL;

  // get connection token
  const getConnectionToken = async () => {
    const token = localStorage.getItem("token") || "";
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/token/connection`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data.token;
  };

  //fetch subscription token
  const getSubscriptionToken = async (channel: string) => {
    const token = localStorage.getItem("token") || "";

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/token/subscription`,
      { channel },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data.token;
  };

  // centrifugo connection for notification
  useEffect(() => {
    if (state?.thread?.thread_id) {
      // Initialize Centrifuge client
      const centrifugeClient: any = new Centrifuge(connectUrl, {
        getToken: getConnectionToken,
        debug: true,
      });

      centrifugeClient.on("connect", () => {
        console.log("Connected to Centrifuge");
      });

      centrifugeClient.on("disconnect", () => {
        console.log("Disconnected from Centrifuge");
      });

      // Function to get the token for the personal channel
      const getPersonalChannelSubscriptionToken = async () => {
        return getSubscriptionToken(state?.thread?.thread_id);
      };

      // Create a subscription to the channel
      const sub = centrifugeClient.newSubscription(state?.thread?.thread_id, {
        getToken: getPersonalChannelSubscriptionToken,
      });

      sub.on("subscribed", () => {
        // console.log("ReplySubscription confirmed:".sub);
        dispatch({ type: ACTIONS.REPLY_SUBSCRIPTION, payload: sub });
      });

      // message publishing
      sub.on("publication", (ctx: any) => {
        // console.log("Reply publishing", ctx?.data);

        if (ctx?.data?.type === "message") {
          dispatch({
            type: ACTIONS.REPLIES,
            payload: { newMessage: ctx.data, isRealTime: true },
          });
        }
      });

      sub.on("error", (ctx: any) => {
        console.error(`Subscription error: ${ctx.message}`);
      });

      // Connect to Centrifuge and subscribe
      centrifugeClient.connect();
      sub.subscribe();

      // Cleanup on component unmount
      return () => {
        sub.unsubscribe();
        centrifugeClient.disconnect();
      };
    }
  }, [connectUrl, dispatch, state?.thread?.thread_id]);

  // Threads page has no channel/DM connection — subscribe to the channel for reply reactions.
  useEffect(() => {
    const channelId = state?.thread?.channels_id;
    if (!isThreadsPage || !channelId) return;

    const centrifugeClient: any = new Centrifuge(connectUrl, {
      getToken: getConnectionToken,
      debug: true,
    });

    const getChannelSubscriptionToken = async () => {
      return getSubscriptionToken(channelId);
    };

    const sub = centrifugeClient.newSubscription(channelId, {
      getToken: getChannelSubscriptionToken,
    });

    sub.on("publication", (ctx: any) => {
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
    });

    sub.on("error", (ctx: any) => {
      console.error(`Subscription error: ${ctx.message}`);
    });

    centrifugeClient.connect();
    sub.subscribe();

    return () => {
      sub.unsubscribe();
      centrifugeClient.disconnect();
    };
  }, [connectUrl, dispatch, isThreadsPage, state?.thread?.channels_id]);

  //

  return <></>;
}
