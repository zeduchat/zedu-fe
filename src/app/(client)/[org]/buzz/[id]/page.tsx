"use client";

import { useState, useContext, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PostRequest } from "~/utils/new-request";
import GreenRoom from "../../_components/meeting/green-room";
import MeetingRoom from "../../_components/meeting/meeting-room";
import { DataContext } from "~/store/GlobalState";
import AgoraConnection from "~/components/layout/centrifugo/agora-connection";
import { ACTIONS } from "~/store/Actions";
import Loading from "~/components/ui/loading";

const hasValidBuzzData = (buzzData: unknown) =>
  buzzData &&
  typeof buzzData === "object" &&
  !Array.isArray(buzzData) &&
  "buzz_id" in buzzData &&
  "agora_token" in buzzData &&
  !!(buzzData as { buzz_id?: string; agora_token?: unknown }).buzz_id &&
  !!(buzzData as { buzz_id?: string; agora_token?: unknown }).agora_token;

export default function MeetingPage() {
  const { id, org } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, dispatch } = useContext(DataContext);
  const { hasJoined, buzzData } = state;

  const shouldDirectJoin = searchParams.get("direct") === "1";
  const directJoinAttempted = useRef(false);

  const [initialMediaState, setInitialMediaState] = useState({
    mic: false,
    video: false,
  });
  const [isDirectJoining, setIsDirectJoining] = useState(shouldDirectJoin);

  useEffect(() => {
    const hydrateBuzzSession = async () => {
      if (!id || !hasJoined || hasValidBuzzData(buzzData)) return;

      const res = await PostRequest(`/buzz/${id}/join`);
      const status = res?.status ?? res?.response?.status;

      if (status === 200 || status === 201) {
        dispatch({ type: ACTIONS.BUZZ_DATA, payload: res.data.data });
        dispatch({
          type: ACTIONS.BUZZ_PARTICIPANTS,
          payload: res.data.data.participants,
        });
      }
    };

    hydrateBuzzSession();
  }, [id, hasJoined, buzzData, dispatch]);

  useEffect(() => {
    if (!shouldDirectJoin || !id || hasJoined || directJoinAttempted.current) {
      return;
    }

    directJoinAttempted.current = true;
    setIsDirectJoining(true);

    const joinDirectly = async () => {
      const res = await PostRequest(`/buzz/${id}/join`);
      const status = res?.status ?? res?.response?.status;

      if (status === 200 || status === 201) {
        dispatch({ type: ACTIONS.HAS_JOINED, payload: true });
        dispatch({ type: ACTIONS.BUZZ_DATA, payload: res.data.data });
        dispatch({
          type: ACTIONS.BUZZ_PARTICIPANTS,
          payload: res.data.data.participants,
        });
        setInitialMediaState({ mic: false, video: false });

        if (org) {
          router.replace(`/${org}/buzz/${id}`);
        }
      }

      setIsDirectJoining(false);
    };

    void joinDirectly();
  }, [shouldDirectJoin, id, hasJoined, dispatch, org, router]);

  const handleJoin = async (mediaState: { mic: boolean; video: boolean }) => {
    const res = await PostRequest(`/buzz/${id}/join`);
    const status = res?.status ?? res?.response?.status;

    if (status === 200 || status === 201) {
      dispatch({ type: ACTIONS.HAS_JOINED, payload: true });
      dispatch({ type: ACTIONS.BUZZ_DATA, payload: res.data.data });
      dispatch({
        type: ACTIONS.BUZZ_PARTICIPANTS,
        payload: res.data.data.participants,
      });
      setInitialMediaState(mediaState);
    }
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#202124]">
      <AgoraConnection />
      {isDirectJoining && !hasJoined ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loading />
        </div>
      ) : !hasJoined ? (
        <GreenRoom onJoin={handleJoin} />
      ) : (
        <MeetingRoom
          initialMic={initialMediaState.mic}
          initialVideo={initialMediaState.video}
        />
      )}
    </div>
  );
}
