"use client";

import {
  EllipsisVertical,
  Hand,
  HandIcon,
  MicOff,
  Pin,
  PinOff,
} from "lucide-react";
import React, { useContext, useEffect, useRef } from "react";
import Image from "next/image";
import {
  AudioWaveBars,
  AudioWaveBorder,
} from "../buzz-management/audio-wave-border";

import { Button } from "~/components/ui/button";
import { useAudioVisualizer } from "~/hooks/useAudioVisualizer";
import { Participant } from "~/hooks/buzz";
import { DataContext } from "~/store/GlobalState";
import {
  getParticipantVideoScale,
  observeParticipantVideoStyles,
} from "~/lib/buzz/participant-video-styles";

const DEFAULT_PARTICIPANT_COLOR = "#4848AD";
const PARTICIPANT_VIDEO_CONTAINER_CLASS =
  "w-full h-full overflow-hidden bg-[#202124] flex items-center justify-center";

const size = 60;

export const BuzzParticipant = ({
  audioTrack,
  videoTrack,
  name,
  handsRaised,
  uid,
  isPinned = false,
  avatarUrl,
  isSolo,
  color,
  user_id,
}: Participant & { avatarUrl?: string }) => {
  const { state } = useContext(DataContext);
  const isLocalVideo =
    String(user_id) === String(state.user?.user_id) ||
    String(uid) === String(state.user?.user_id);
  const { isSpeaking, volume } = useAudioVisualizer({
    audioTrack: audioTrack || null,
    threshold: 0.1,
  });

  const videoRef = useRef<HTMLDivElement | null>(null);
  const bgColor = color || DEFAULT_PARTICIPANT_COLOR;
  const lighter = `color-mix(in srgb, ${bgColor} 80%, white)`;
  const darker = `color-mix(in srgb, ${bgColor} 80%, black)`;

  const handlePin = () => {
    // setParticipantsData((prev: Participant[]) => {
    //   const updated = prev.map((p) =>
    //     p.uid === uid
    //       ? { ...p, isPinned: !p.isPinned }
    //       : { ...p, isPinned: false }
    //   );
    //   // console.log("Pin toggled for uid:", uid, "New state:", updated);
    //   return updated;
    // });
  };

  useEffect(() => {
    if (!videoTrack || !videoRef.current) return;

    const container = videoRef.current;
    let disposed = false;
    let stopObserving = () => {};

    const playVideo = async () => {
      await videoTrack.play(container, { fit: "cover" });
      if (disposed) return;
      stopObserving = observeParticipantVideoStyles(container, {
        mirror: isLocalVideo,
        scale: getParticipantVideoScale(isLocalVideo),
      });
    };

    void playVideo();

    return () => {
      disposed = true;
      stopObserving();
      videoTrack.stop();
    };
  }, [videoTrack, isLocalVideo]);

  return (
    <div
      className={`min-w-[150px] h-full min-h-[250px] w-full flex justify-center items-center rounded-xl overflow-hidden relative ${audioTrack ? "border-4 " : "border-0"}`}
      style={
        audioTrack
          ? ({
              borderColor: lighter,
              borderStyle: "solid",
            } as React.CSSProperties)
          : undefined
      }
    >
      {handsRaised && (
        <div className="absolute top-4 left-4 z-30 animate-in fade-in zoom-in duration-300">
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full shadow-lg border border-white/20`}
            style={{ backgroundColor: darker }}
          >
            <div className="bg-[#202124] rounded-full h-[30px] w-[30px] flex items-center justify-center">
              <HandIcon
                size={18}
                fill="currentColor"
                strokeWidth={2.5}
                color="white"
              />
            </div>

            <span className="text-white text-[11px] font-bold tracking-wide uppercase">
              {name}
            </span>
          </div>
        </div>
      )}
      {videoTrack ? (
        <div ref={videoRef} className={PARTICIPANT_VIDEO_CONTAINER_CLASS} />
      ) : (
        <div
          className="w-full h-full space-y-5 flex flex-col items-center justify-center text-white font-semibold text-2xl"
          style={{ backgroundColor: bgColor }}
        >
          <AudioWaveBorder
            isSpeaking={isSpeaking}
            color={bgColor}
            size={size}
            volume={volume}
          >
            <div
              className="size-10 p-10 rounded-full flex justify-center items-center relative overflow-hidden"
              style={{ backgroundColor: darker }}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name || "Participant"}
                  fill
                  className="object-cover"
                />
              ) : (
                <p className="text-4xl font-light text-white">
                  {name ? name.charAt(0).toUpperCase() : ""}
                </p>
              )}
            </div>
          </AudioWaveBorder>

          <div className="px-2 h-8 z-10 text-white">
            <div className="z-10 flex items-center justify-center gap-2 w-full">
              <p className="text-white text-sm font-medium drop-shadow-md truncate max-w-[200px]">
                {name}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 w-full mt-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePin();
                }}
                type="button"
                style={{ pointerEvents: "auto" }}
                className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors cursor-pointer ${
                  isPinned
                    ? "bg-black/50 hover:bg-black/60"
                    : "bg-black/40 hover:bg-black/50"
                }`}
                title={isPinned ? "Unpin participant" : "Pin participant"}
              >
                {isPinned ? (
                  <PinOff className="size-4" fontWeight={2} />
                ) : (
                  <Pin className="size-4" fontWeight={1} />
                )}
              </button>
              <Button className="flex items-center justify-center h-8 w-8 bg-black/40 hover:bg-black/60 rounded-full p-1 border-0">
                {audioTrack ? (
                  <AudioWaveBars isSpeaking={isSpeaking} volume={volume} />
                ) : (
                  <MicOff className="size-4" fontWeight={1} />
                )}
              </Button>
              {/* <Button className="flex items-center justify-center h-8 w-8 bg-black/40 hover:bg-black/60 rounded-full text-white p-0 border-0">
                <EllipsisVertical className="size-4" fontWeight={1} />
              </Button> */}
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {!audioTrack && (
          <div className="bg-white/60 p-1.5 rounded-full backdrop-blur-sm">
            <MicOff size={16} className="text-[#ea4335]" />
          </div>
        )}
      </div>
    </div>
  );
};
