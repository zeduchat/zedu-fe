"use client";
import { useContext, useEffect } from "react";
import { DataContext } from "~/store/GlobalState";
import axios from "axios";
import { Centrifuge } from "centrifuge";
import { ACTIONS } from "~/store/Actions";
import { useParams } from "next/navigation";

/* eslint-disable */

//

export default function ChannelConnection() {
  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);

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
    if (id) {
      // Initialize Centrifuge client
      const centrifugeClient: any = new Centrifuge(connectUrl, {
        getToken: getConnectionToken,
        debug: true,
      });

      centrifugeClient.on("connect", () => {
        // console.log("Connected to Centrifuge");
      });

      centrifugeClient.on("disconnect", () => {
        // console.log("Disconnected from Centrifuge");
      });

      // Function to get the token for the personal channel
      const getPersonalChannelSubscriptionToken = async () => {
        return getSubscriptionToken(id);
      };

      // Create a subscription to the channel
      const sub = centrifugeClient.newSubscription(id, {
        getToken: getPersonalChannelSubscriptionToken,
      });

      sub.on("subscribed", () => {
        // console.log("Subscription confirmed:", sub);
        dispatch({ type: ACTIONS.CHANNEL_SUBSCRIPTION, payload: sub });
      });

      // message publishing
      sub.on("publication", (ctx: any) => {
        const result = ctx?.data;
        // console.log("channel publishing", ctx);

        if (ctx?.data?.type === "message") {
          dispatch({
            type: ACTIONS.MESSAGES,
            payload: { newMessage: ctx.data, isRealTime: true },
          });
        }

        // ------------CHANNELS SECTION-----------------------

        if (
          result?.section === "channels_section" &&
          result?.notification_type === "reply_count_change"
        ) {
          const message = ctx?.data?.data;
          const updates = ctx?.data?.update_change;

          dispatch({
            type: ACTIONS.UPDATE_MESSAGE_THREAD,
            payload: {
              threadId: message.thread_id,
              reply: message,
              updates,
            },
          });
        }

        // channel message edit
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "updated"
        ) {
          const message = ctx?.data?.data;

          dispatch({
            type: ACTIONS.EDIT_CHANNEL_MESSAGE,
            payload: {
              threadId: message.thread_id,
              newMessageData: message,
            },
          });
        }

        // Channel message delete
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "deleted"
        ) {
          const message = ctx?.data?.modification_ids;

          dispatch({
            type: ACTIONS.DELETE_CHANNEL_MESSAGE,
            payload: {
              threadId: message.thread_id,
            },
          });
        }

        // Channel media delete
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "updated_media"
        ) {
          const updatedMessage = ctx?.data?.data;

          dispatch({
            type: ACTIONS.DELETE_CHANNEL_MEDIA,
            payload: { updatedMessage },
          });
        }

        //---------------Reply section---------------------
        if (
          result?.section === "reply_message" &&
          result?.notification_type === "updated"
        ) {
          const message = ctx?.data?.data;
          const id = ctx?.data?.modification_ids?.message_id;

          dispatch({
            type: ACTIONS.EDIT_REPLY_MESSAGE,
            payload: {
              threadId: id,
              newMessageData: message,
            },
          });
        }

        if (
          result?.section === "reply_message" &&
          result?.notification_type === "deleted"
        ) {
          const message = ctx?.data?.modification_ids;
          const updates = ctx?.data?.update_change;

          dispatch({
            type: ACTIONS.DELETE_MESSAGE_THREAD_REPLY,
            payload: {
              threadId: message.thread_id,
              messageId: message?.message_id,
              updates,
            },
          });
        }

        // ----------------Pinned message section-------------------------
        // pinned message
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "pinned_message_event"
        ) {
          const ids = ctx?.data?.modification_ids;
          const details = ctx?.data?.pinned_details;

          dispatch({
            type: ACTIONS.UPDATE_CHANNEL_PIN,
            payload: {
              threadId: ids.thread_id,
              is_pin: true,
              details,
            },
          });
        }

        // pinned reply
        if (
          result?.section === "reply_message" &&
          result?.notification_type === "pinned_message_event"
        ) {
          const ids = ctx?.data?.modification_ids;

          dispatch({
            type: ACTIONS.UPDATE_REPLY_PIN,
            payload: {
              threadId: ids.message_id,
              is_pin: true,
            },
          });
        }

        // unpinned message
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "unpinned_message_event"
        ) {
          const ids = ctx?.data?.modification_ids;

          dispatch({
            type: ACTIONS.UPDATE_CHANNEL_PIN,
            payload: {
              threadId: ids.thread_id,
              is_pin: false,
            },
          });
        }

        // unpinned reply
        if (
          result?.section === "reply_message" &&
          result?.notification_type === "unpinned_message_event"
        ) {
          const ids = ctx?.data?.modification_ids;

          dispatch({
            type: ACTIONS.UPDATE_REPLY_PIN,
            payload: {
              threadId: ids.message_id,
              is_pin: false,
            },
          });
        }

        // ----------------REACTIONS SECTION-------------------------

        // thread thread
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "reaction_event"
        ) {
          const ids = ctx?.data?.modification_ids;
          const reactions = ctx?.data?.reactions;

          dispatch({
            type: ACTIONS.UPDATE_CHANNEL_REACTIONS,
            payload: {
              threadId: ids.thread_id,
              reactions,
            },
          });
        }

        // channel reply
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

      // Connect to Centrifuge and subscribe
      centrifugeClient.connect();
      sub.subscribe();

      // Cleanup on component unmount
      return () => {
        sub.unsubscribe();
        centrifugeClient.disconnect();
      };
    }
  }, [id, connectUrl, dispatch]);

  //

  return <div></div>;
}
