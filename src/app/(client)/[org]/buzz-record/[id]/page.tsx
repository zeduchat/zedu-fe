"use client";

import { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "lucide-react";
import { PostRequest } from "~/utils/new-request";
import MeetingRoom from "../../_components/meeting/meeting-room";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { RECORDER_SESSION_MODE } from "~/lib/buzz/session";

const hasValidBuzzData = (buzzData: unknown) =>
  buzzData &&
  typeof buzzData === "object" &&
  !Array.isArray(buzzData) &&
  "buzz_id" in buzzData &&
  "agora_token" in buzzData &&
  !!(buzzData as { buzz_id?: string; agora_token?: unknown }).buzz_id &&
  !!(buzzData as { buzz_id?: string; agora_token?: unknown }).agora_token;

export default function BuzzRecordPage() {
  const { id } = useParams();
  const { state, dispatch } = useContext(DataContext);
  const { hasJoined, buzzData, buzzSessionMode } = state;
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (buzzSessionMode !== RECORDER_SESSION_MODE) return;

    const bootstrapRecorderSession = async () => {
      if (!id || hasValidBuzzData(buzzData)) return;

      setInitializing(true);

      const res = await PostRequest(`/buzz/${id}/join`);
      if (res.status === 200 || res.status === 201) {
        dispatch({ type: ACTIONS.BUZZ_DATA, payload: res.data.data });
        dispatch({
          type: ACTIONS.BUZZ_PARTICIPANTS,
          payload: res.data.data.participants,
        });
        dispatch({ type: ACTIONS.HAS_JOINED, payload: true });
      }

      setInitializing(false);
    };

    bootstrapRecorderSession();
  }, [id, buzzData, buzzSessionMode, dispatch]);

  useEffect(() => {
    const hydrateBuzzSession = async () => {
      if (
        buzzSessionMode !== RECORDER_SESSION_MODE ||
        !id ||
        !hasJoined ||
        hasValidBuzzData(buzzData)
      ) {
        return;
      }

      const res = await PostRequest(`/buzz/${id}/join`);
      if (res.status === 200 || res.status === 201) {
        dispatch({ type: ACTIONS.BUZZ_DATA, payload: res.data.data });
        dispatch({
          type: ACTIONS.BUZZ_PARTICIPANTS,
          payload: res.data.data.participants,
        });
      }
    };

    hydrateBuzzSession();
  }, [id, hasJoined, buzzData, buzzSessionMode, dispatch]);

  if (buzzSessionMode !== RECORDER_SESSION_MODE) {
    return (
      <div className="h-[calc(100dvh-60px)] bg-[#202124] flex items-center justify-center text-white">
        Invalid recorder session.
      </div>
    );
  }

  if (initializing || !hasJoined || !hasValidBuzzData(buzzData)) {
    return (
      <div className="h-[calc(100dvh-60px)] bg-[#202124] flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 animate-pulse text-white font-medium">
          <Loader size={20} className="animate-spin text-white" />
          Preparing recorder...
        </div>
      </div>
    );
  }

  return <MeetingRoom />;
}
