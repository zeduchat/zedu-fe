"use client";

import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Mic, MicOff, Video, VideoOff, Sparkles, Loader } from "lucide-react";
import { cn } from "~/lib/utils";
import { DataContext } from "~/store/GlobalState";
import { BuzzRequest, GetRequest } from "~/utils/new-request";
import { useParams } from "next/navigation";
import { ACTIONS } from "~/store/Actions";
import ParticipantStack from "./participant-stack";
import BuzzTimeout from "./buzz-timeout";

interface GreenRoomProps {
  onJoin: (state: { mic: boolean; video: boolean }) => void;
}

const GreenRoom: React.FC<GreenRoomProps> = ({ onJoin }) => {
  const { state, dispatch } = useContext(DataContext);
  const { user, buzzParticipants, buzzData } = state;
  const videoRef = useRef<HTMLDivElement>(null);
  const { id } = useParams() as { id: string };

  // Local state for the preview
  const [previewTrack, setPreviewTrack] = useState<any>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const initiallizeCallState = async () => {
      setLoadError(null);
      setIsInitializing(true);

      try {
        const res = await GetRequest(`/buzz/${id}/metadata`);
        const status = res?.status ?? res?.response?.status;

        if (status === 200 || status === 201) {
          const data = res.data.data;
          const participants = data.participants || [];

          // Check if I am already considered "in" the call
          const isStillInCall = participants.some(
            (p: any) => String(p.user_id) === String(user?.user_id)
          );

          if (isStillInCall) {
            // Force a leave to clear the backend session
            await BuzzRequest(`/buzz/${id}/leave`, { userId: user?.user_id });

            // Filter myself out of the local participants list for the UI count
            const cleanedParticipants = participants.filter(
              (p: any) => String(p.user_id) !== String(user?.user_id)
            );

            dispatch({ type: ACTIONS.BUZZ_DATA, payload: data });
            dispatch({
              type: ACTIONS.BUZZ_PARTICIPANTS,
              payload: cleanedParticipants,
            });
          } else {
            dispatch({ type: ACTIONS.BUZZ_DATA, payload: data });
            dispatch({
              type: ACTIONS.BUZZ_PARTICIPANTS,
              payload: participants,
            });
          }
        } else {
          const message =
            res?.response?.data?.message ||
            res?.data?.message ||
            "Unable to load this buzz. Check the link or try again.";
          setLoadError(message);
        }
      } catch {
        setLoadError("Unable to load this buzz. Check the link or try again.");
      } finally {
        setIsInitializing(false);
      }
    };

    if (id) {
      initiallizeCallState();
    }
  }, [id, user?.user_id, dispatch]);

  useEffect(() => {
    let track: any;
    const startPreview = async () => {
      if (!isCamOn) return;

      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      try {
        track = await AgoraRTC.createCameraVideoTrack();
        setPreviewTrack(track);
      } catch (e) {
        console.error("Camera access denied", e);
        setIsCamOn(false);
      }
    };

    startPreview();

    return () => {
      if (track) {
        track.stop();
        track.close();
      }
    };
  }, [isCamOn]);

  // Play track when camera is toggled on
  useEffect(() => {
    if (previewTrack && isCamOn && videoRef.current) {
      previewTrack.setEnabled(true);
      previewTrack.play(videoRef.current);
    } else if (previewTrack) {
      previewTrack.setEnabled(false);
      previewTrack.stop();
    }
  }, [isCamOn, previewTrack]);

  const handleJoin = async () => {
    onJoin({ mic: isMicOn, video: isCamOn });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className="relative w-full aspect-video bg-[#202124] rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {isCamOn ? (
              <div
                ref={videoRef}
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white bg-zinc-900">
                <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold uppercase border-2 border-zinc-700 shadow-xl">
                  {user?.username?.charAt(0) || "U"}
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 z-20">
              <span className="capitalize bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/10">
                {user?.username || "You"}
              </span>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={cn(
                  "p-3 rounded-full border transition-all duration-200",
                  isMicOn
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    : "bg-red-500 border-red-500 text-white shadow-lg"
                )}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                onClick={() => setIsCamOn(!isCamOn)}
                className={cn(
                  "p-3 rounded-full border transition-all duration-200",
                  isCamOn
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    : "bg-red-500 border-red-500 text-white shadow-lg"
                )}
              >
                {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center text-center space-y-6">
          <h1 className="text-3xl font-normal text-[#202124] dark:text-zinc-100">
            Ready to join?
          </h1>

          {isInitializing ? (
            <div className="flex items-center gap-3 animate-pulse font-medium">
              <Loader size={20} className="mx-auto animate-spin" />
              Please wait, You'll join in a moment ...
            </div>
          ) : loadError ? (
            <p className="text-sm text-red-600 max-w-sm">{loadError}</p>
          ) : (
            <ParticipantStack participants={buzzParticipants} />
          )}
          <div className="flex flex-col w-full max-w-[280px] gap-3">
            <button
              disabled={isInitializing || Boolean(loadError)}
              onClick={handleJoin}
              className="w-full bg-[#1A73E8] hover:bg-[#1B66C9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-full shadow-sm transition-all text-sm tracking-wide"
            >
              Join now
            </button>
          </div>
        </div>
      </div>

      <BuzzTimeout />
    </div>
  );
};

export default GreenRoom;
