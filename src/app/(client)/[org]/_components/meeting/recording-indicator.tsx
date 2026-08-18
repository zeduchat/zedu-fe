"use client";

import React, { useContext } from "react";
import { Loader2, Square } from "lucide-react";
import { cn } from "~/lib/utils";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";
import { showInfo } from "~/components/toast/sonner";
import { ACTIONS } from "~/store/Actions";

const RecordingIndicator = ({
  readOnlyUi = false,
}: {
  readOnlyUi?: boolean;
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { state, dispatch } = useContext(DataContext);
  const {
    buzzData,
    buzzStoppingRecording: isStopping,
    buzzStartingRecording: isStarting,
  } = state;

  const isPending = isStarting || isStopping;
  const statusLabel = isStarting
    ? "Starting"
    : isStopping
      ? "Stopping"
      : "Recording";

  const handleStop = async () => {
    if (readOnlyUi || isPending) return;

    dispatch({ type: ACTIONS.BUZZ_STOPPING_RECORDING, payload: true });
    try {
      const res = await PostRequest(
        `/buzz/${buzzData?.buzz_id}/recording/stop`,
        {}
      );
      if (res?.status === 200 || res?.status === 201) {
        dispatch({
          type: ACTIONS.BUZZ_DATA,
          payload: {
            ...buzzData,
            is_recording: false,
          },
        });
        showInfo("Recording stopped");
      }
    } finally {
      dispatch({ type: ACTIONS.BUZZ_STOPPING_RECORDING, payload: false });
    }
  };

  if (!buzzData?.is_recording && !isPending) return null;

  return (
    <div
      className="shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex items-center bg-black/70 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl transition-all duration-300 ease-in-out px-3 h-9",
          isHovered && !isPending ? "gap-3" : "gap-2"
        )}
      >
        {isPending ? (
          <Loader2 size={14} className="shrink-0 animate-spin text-white/90" />
        ) : (
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </div>
        )}

        <span className="text-white text-[11px] font-bold tracking-widest uppercase select-none">
          {statusLabel}
        </span>

        <div
          className={cn(
            "flex items-center overflow-hidden transition-all duration-300 ease-in-out",
            !readOnlyUi && isHovered && !isPending
              ? "w-20 opacity-100"
              : "w-0 opacity-0"
          )}
        >
          <button
            onClick={handleStop}
            disabled={isPending}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-red-500 hover:text-white text-white/90 px-2.5 py-1 rounded-full border border-white/10 transition-colors whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
          >
            <Square size={10} fill="currentColor" />
            <span className="text-[10px] font-bold uppercase">Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingIndicator;
