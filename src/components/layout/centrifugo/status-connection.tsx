"use client";
import { useContext, useEffect, useRef } from "react";
import { DataContext } from "~/store/GlobalState";
import axios from "axios";
import { Centrifuge } from "centrifuge";
import { ACTIONS } from "~/store/Actions";
import { ToastContainer } from "react-toastify";
import { usePathname } from "next/navigation";

const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

const getStatusFieldsFromPayload = (statusPayload: {
  text?: string;
  emoji?: string;
  online?: boolean;
  expiry?: number;
  visibility?: string;
}) => ({
  text: statusPayload?.text ?? "",
  icon: statusPayload?.emoji ?? "",
  online: statusPayload?.online,
  status_expiry: statusPayload?.expiry,
  status_visibility: statusPayload?.visibility,
});

export default function StatusConnection() {
  const { state, dispatch } = useContext(DataContext);
  const { orgId, user, orgMembers } = state;
  const params = usePathname();

  const routeUrl = `${CLIENT_URL}${params}`;
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const connectUrl: any = process.env.NEXT_PUBLIC_CONNECT_URL;
  const userRef = useRef(user);
  const orgMembersRef = useRef(orgMembers);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    orgMembersRef.current = orgMembers;
  }, [orgMembers]);

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
    if (!orgId) return;

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
      return getSubscriptionToken(orgId);
    };

    // Create a subscription to the channel
    const sub = centrifugeClient.newSubscription(orgId, {
      getToken: getPersonalChannelSubscriptionToken,
    });

    sub.on("subscribed", () => {
      // console.log("Subscription confirmeds for general notification:", sub);
    });

    // message publishing
    sub.on("publication", (ctx: any) => {
      const data = ctx?.data;
      // console.log("Received publication on org:", data);

      if (data?.notification_type === "profile_status_updated") {
        const targetUserId =
          data?.modification_ids?.user_id || data?.data?.user_id;
        const statusPayload = data?.data?.status;

        if (!targetUserId || !statusPayload) return;

        const statusFields = getStatusFieldsFromPayload(statusPayload);
        const currentUser = userRef.current;

        if (
          currentUser &&
          String(targetUserId) === String(currentUser.user_id)
        ) {
          dispatch({
            type: ACTIONS.USER,
            payload: {
              ...currentUser,
              ...statusFields,
            },
          });

          try {
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            if (storedUser?.user_id || storedUser?.id) {
              localStorage.setItem(
                "user",
                JSON.stringify({
                  ...storedUser,
                  ...statusFields,
                })
              );
            }
          } catch {
            // ignore localStorage parse errors
          }
        }

        const members = orgMembersRef.current || [];
        const memberIndex = members.findIndex(
          (member: { id?: string; user_id?: string }) =>
            String(member.id) === String(targetUserId) ||
            String(member.user_id) === String(targetUserId)
        );

        if (memberIndex !== -1) {
          const updatedMembers = [...members];
          updatedMembers[memberIndex] = {
            ...updatedMembers[memberIndex],
            ...statusFields,
          };
          dispatch({ type: ACTIONS.ORG_MEMBERS, payload: updatedMembers });
        }
      }

      if (data?.notification_type === "profile_updated") {
        dispatch({ type: ACTIONS.TRIGGER_CALLBACK });
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
