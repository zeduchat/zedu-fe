"use client";
import { useContext, useEffect, useRef } from "react";
import { DataContext } from "~/store/GlobalState";
import axios from "axios";
import { Centrifuge } from "centrifuge";
import { ACTIONS } from "~/store/Actions";
import { ToastContainer } from "react-toastify";
import { useParams, usePathname } from "next/navigation";
import images from "~/assets/images";
import { showInfo } from "~/components/toast/sonner";
import { playBuzzParticipantJoinSound } from "~/lib/buzz/play-join-sound";
import {
  registerNotificationBadge,
  isHomeRoute,
  isNotificationsRoute,
} from "~/lib/notifications/notification-badge";

const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

//

export default function GeneralNotificationConnection() {
  const { state, dispatch } = useContext(DataContext);
  const { orgId } = state;
  const pathname = usePathname();
  const params = useParams();
  const id = params.id as string;
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const routeUrl = `${CLIENT_URL}${pathname}`;
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const connectUrl: any = process.env.NEXT_PUBLIC_CONNECT_URL;
  const participantsRef = useRef<any[]>(state?.buzzParticipants || []);
  const hasJoinedRef = useRef(state.hasJoined);

  useEffect(() => {
    participantsRef.current = state?.buzzParticipants || [];
  }, [state?.buzzParticipants]);

  useEffect(() => {
    hasJoinedRef.current = state.hasJoined;
  }, [state.hasJoined]);

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

  useEffect(() => {
    // ask for permission early on
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          console.log("Notification permission:", permission);
        });
      }
    }
  }, []);

  // centrifugo connection for notification
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

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
      return getSubscriptionToken(`${orgId}/${user?.id}`);
    };

    // Create a subscription to the channel
    const sub = centrifugeClient.newSubscription(`${orgId}/${user?.id}`, {
      getToken: getPersonalChannelSubscriptionToken,
    });

    sub.on("subscribed", () => {
      // console.log("Subscription confirmeds for general notification:", sub);
    });

    // message publishing
    sub.on("publication", (ctx: any) => {
      dispatch({ type: ACTIONS.NOTIFICATIONS, payload: ctx?.data });
      dispatch({ type: ACTIONS.NOTIFY, payload: ctx?.data?.data });

      if (
        !isHomeRoute(pathnameRef.current) &&
        !isNotificationsRoute(pathnameRef.current) &&
        registerNotificationBadge(ctx?.data)
      ) {
        dispatch({ type: ACTIONS.INCREMENT_NOTIFICATION_BADGE });
      }

      const result = ctx?.data;

      console.log("general notification", ctx?.data);

      if (
        result?.section === "thread_message" &&
        result?.notification_type == "new_message"
      ) {
        if (audioPlayer.current === null) return;
      }

      // Thread count and mention count highlight
      if (
        result?.section === "channels_section" &&
        result?.notification_type === "unread_thread_change"
      ) {
        dispatch({
          type: ACTIONS.THREAD_COUNT,
          payload: ctx.data.data.thread_count,
        });

        dispatch({
          type: ACTIONS.UPDATE_THREAD_COUNT,
          payload: {
            channels_id: ctx.data.data.channels_id,
            mention_count: ctx.data.data.mention_count,
            thread_count: ctx.data.data.thread_count,
          },
        });
      }

      // DM notifications
      if (
        result?.section === "dm_channels_section" &&
        result?.notification_type === "unread_thread_change"
      ) {
        dispatch({
          type: ACTIONS.DM_COUNT,
          payload: ctx.data.data.thread_count,
        });

        dispatch({
          type: ACTIONS.UPDATE_DM_COUNT,
          payload: {
            channel_id: ctx.data.data.channel_id,
            thread_count: ctx.data.data.thread_count,
          },
        });
      }

      // Org threads sidebar badge (server-maintained unseen count)
      if (
        result?.section === "thread_message" &&
        result?.notification_type === "thread_notification"
      ) {
        const unseen = result?.data?.unseen_thread_count;
        if (typeof unseen === "number") {
          dispatch({
            type: ACTIONS.UNSEEN_THREAD_COUNT,
            payload: unseen,
          });
        }
      }

      if (
        result.notification_type === "buzz_started" ||
        result.notification_type === "buzz_ended"
      ) {
        dispatch({
          type: ACTIONS.BUZZ_SIGNAL_UPDATE,
          payload: {
            notification_type: result.notification_type,
            buzzEventData: result.data,
          },
        });
      }

      if (result.notification_type === "buzz_started") {
        if (id === String(result.data?.channel_id)) {
          const active_buzz = {
            buzz_id: result.data?.buzz_id,
            host_id: result.data?.host_id,
            host_name: result.data?.host_name || "A participant",
            participant_count: result.data?.participant_ids?.length || 0,
            started_at: result.data?.created_at,
          };
          dispatch({
            type: ACTIONS.ADD_ACTIVE_BUZZ,
            payload: active_buzz,
          });
        }
      } else if (result.notification_type === "buzz_ended") {
        if (id === String(result.data?.channel_id)) {
          dispatch({
            type: ACTIONS.REMOVE_ACTIVE_BUZZ,
          });
        }
      }

      // Handle incoming call event
      if (result?.notification_type === "direct_call_initiated") {
        const callInfo = result?.data;
        dispatch({
          type: ACTIONS.SHOW_INCOMING_CALL_POPUP,
          payload: {
            callerName: callInfo.caller_name,
            avatarUrl:
              callInfo.avatar_url || callInfo.default_avatar_url || images.user,
            channelId: callInfo.channel_id,
            buzzId: callInfo.buzz_id,
            callerId: callInfo.caller_id,
          },
        });
      }

      if (result?.notification_type === "direct_call_response") {
        const payload = result?.data;
        const currentParticipants = participantsRef.current || [];
        const buzzEventData = payload;
        const newUser = payload?.user_joined;
        const rejectedUser =
          buzzEventData?.user_rejected || payload?.user_rejected;
        const timeoutUser =
          buzzEventData?.user_timeout || payload?.user_timeout;
        const joinStatus = payload?.join_status || "";

        if (joinStatus === "accept" || joinStatus === "accepted") {
          dispatch({ type: ACTIONS.HIDE_INCOMING_CALL_POPUP });
        }

        if (
          (joinStatus === "accept" || joinStatus === "accepted") &&
          newUser?.user_id
        ) {
          const participantToAdd = {
            ...newUser,
            videoTrack: null,
            audioTrack: null,
            handsRaised: false,
            isPinned: false,
            status: "active",
          };

          const existingIndex = currentParticipants.findIndex(
            (participant: any) =>
              String(participant?.user_id || participant?.id) ===
              String(newUser.user_id)
          );

          let updatedParticipants: any[];

          if (existingIndex !== -1) {
            // Override the existing pending entry with the accepted participant object
            updatedParticipants = [...currentParticipants];
            updatedParticipants[existingIndex] = {
              ...currentParticipants[existingIndex],
              ...participantToAdd,
            };
          } else {
            // User not yet in the list, append them
            updatedParticipants = [...currentParticipants, participantToAdd];
          }

          dispatch({
            type: ACTIONS.BUZZ_PARTICIPANTS,
            payload: updatedParticipants,
          });

          if (String(newUser.user_id) !== String(user?.user_id)) {
            playBuzzParticipantJoinSound({
              joiningUserId: newUser.user_id,
              isInCall: hasJoinedRef.current,
            });
            showInfo(
              "Info",
              `${newUser.username || "A participant"} joined the buzz`
            );
          }
        }

        if (
          (joinStatus === "decline" || joinStatus === "declined") &&
          rejectedUser?.user_id
        ) {
          const updatedParticipants = currentParticipants.filter(
            (participant: any) =>
              String(participant?.user_id || participant?.id) !==
              String(rejectedUser.user_id)
          );

          dispatch({
            type: ACTIONS.BUZZ_PARTICIPANTS,
            payload: updatedParticipants,
          });

          if (String(rejectedUser.user_id) !== String(user?.user_id)) {
            showInfo(
              "Buzz Declined",
              `${rejectedUser.username || "A participant"} declined the buzz`
            );
          }
        }

        if (joinStatus === "timeout" && timeoutUser?.user_id) {
          const updatedParticipants = currentParticipants.filter(
            (participant: any) =>
              String(participant?.user_id || participant?.id) !==
              String(timeoutUser.user_id)
          );

          dispatch({
            type: ACTIONS.BUZZ_PARTICIPANTS,
            payload: updatedParticipants,
          });

          if (String(timeoutUser.user_id) !== String(user?.user_id)) {
            showInfo(
              "Buzz Timeout",
              `${timeoutUser.username || "A participant"} didn't respond to the buzz`
            );
          }
        }
      }

      // Handle direct call canceled: hide popup only
      if (result?.notification_type === "direct_call_canceled") {
        dispatch({ type: ACTIONS.HIDE_INCOMING_CALL_POPUP });
      }

      if (
        result?.notification_type === "trigger_notification" &&
        result?.data?.trigger_action === "joined"
      ) {
        dispatch({ type: ACTIONS.JOIN_CALLBACK });
      }

      if (
        result?.notification_type === "trigger_notification" &&
        result?.data?.trigger_action === "leave"
      ) {
        dispatch({ type: ACTIONS.LEAVE_CALLBACK });
      }

      if (
        result?.notification_type === "trigger_notification" &&
        result?.data?.trigger_action === "create"
      ) {
        dispatch({ type: ACTIONS.CREATE_CALLBACK });
      }
    });

    sub.on("error", (ctx: any) => {
      console.log(`Subscription error: ${ctx.message}`);
    });

    // Connect to Centrifuge and subscribe
    centrifugeClient.connect();
    sub.subscribe();

    // Cleanup on component unmount
    return () => {
      sub.unsubscribe();
      centrifugeClient.disconnect();
    };
  }, [connectUrl, dispatch, orgId]);

  //

  return (
    <div>
      <ToastContainer limit={1} />
      <audio controls ref={audioPlayer} style={{ display: "none" }}>
        <source src="/audio/new-sound.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
