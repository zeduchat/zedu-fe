"use client";
import { useContext, useEffect } from "react";
import { DataContext } from "~/store/GlobalState";
import axios from "axios";
import { Centrifuge } from "centrifuge";
import { ACTIONS } from "~/store/Actions";
import { useParams } from "next/navigation";

/** eslint-disable */

//

export default function ChatConnection() {
  const params = useParams();
  const id = params.id as string;
  const { dispatch } = useContext(DataContext);

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
        console.log("Connected to Centrifuge");
      });

      centrifugeClient.on("disconnect", () => {
        console.log("Disconnected from Centrifuge");
      });

      // Function to get the token for the personal channel
      const getPersonalChannelSubscriptionToken = async () => {
        return getSubscriptionToken(id);
      };

      // Create a subscription to the channel
      const sub = centrifugeClient.newSubscription(id, {
        getToken: getPersonalChannelSubscriptionToken,
      });

      // message publishing
      sub.on("publication", (ctx: any) => {
        const result = ctx?.data;
        // console.log("chat conn", ctx);
        const { data } = ctx;
        // console.log("DM chat publishing", data);
        dispatch({ type: ACTIONS.AGENT_STATE, payload: ctx?.data });

        if (data?.type === "message" && data.user_type === "user") {
          dispatch({
            type: ACTIONS.CHATS,
            payload: { newMessage: data, isRealTime: true },
          });
        }

        if (
          data?.type === "message" &&
          data.user_type === "bot" &&
          data?.streaming
        ) {
          dispatch({
            type: ACTIONS.STREAM_APPEND,
            payload: { message: data },
          });
        }

        // update the reply count from reply message
        if (
          result?.section === "channels_section" &&
          result?.notification_type === "reply_count_change"
        ) {
          const message = ctx?.data?.data;
          const updates = ctx?.data?.update_change;

          dispatch({
            type: ACTIONS.UPDATE_DM_MESSAGE_THREAD,
            payload: {
              threadId: message.thread_id,
              reply: message,
              updates,
            },
          });
        }

        // update the message count for agents
        if (
          result?.section === "agent_channels_section" &&
          result?.notification_type === "reply_count_change"
        ) {
          const message = ctx?.data?.data;
          const updates = ctx?.data?.update_change;

          dispatch({
            type: ACTIONS.UPDATE_DM_MESSAGE_THREAD,
            payload: {
              threadId: message.thread_id,
              reply: message,
              updates,
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
            type: ACTIONS.DELETE_DM_THREAD_REPLY,
            payload: {
              threadId: message.thread_id,
              messageId: message?.message_id,
              updates,
            },
          });
        }

        // delete dm message
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "deleted"
        ) {
          const message = ctx?.data?.modification_ids;

          dispatch({
            type: ACTIONS.DELETE_DM_MESSAGE,
            payload: {
              threadId: message.thread_id,
            },
          });
        }

        // Edit dm message
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "updated"
        ) {
          const message = ctx?.data?.data;

          dispatch({
            type: ACTIONS.EDIT_DM_MESSAGE,
            payload: {
              threadId: message.thread_id,
              newMessageData: message,
            },
          });
        }

        // Edit reply message
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

        // pinned message
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "pinned_message_event"
        ) {
          const ids = ctx?.data?.modification_ids;
          const details = ctx?.data?.pinned_details;

          dispatch({
            type: ACTIONS.UPDATE_DM_PIN,
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
          const details = ctx?.data?.pinned_details;

          dispatch({
            type: ACTIONS.UPDATE_REPLY_PIN,
            payload: {
              threadId: ids.message_id,
              is_pin: true,
              details,
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
            type: ACTIONS.UPDATE_DM_PIN,
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

        // =======REACTIONS=============

        //  dm thread
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "reaction_event"
        ) {
          const ids = ctx?.data?.modification_ids;
          const reactions = ctx?.data?.reactions;

          dispatch({
            type: ACTIONS.UPDATE_DM_REACTIONS,
            payload: {
              threadId: ids.thread_id,
              reactions,
            },
          });
        }

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
      dispatch({ type: ACTIONS.CHAT_SUBSCRIPTION, payload: sub });

      // Cleanup on component unmount
      return () => {
        sub.unsubscribe();
        centrifugeClient.disconnect();
      };
    }
  }, [id, connectUrl, dispatch]);

  //

  return <></>;
}
