import React from "react";
import { BuzzParticipant } from "./CallParticipant";
import { ScreenSharePlayer } from "./screen-share-player";
import { ScrollArea } from "~/components/ui/scroll-area";

interface CallParticipantListProps {
  isFullScreen?: boolean;
  chatScreenShareLayout?: boolean;
  data?: any[];
  localVideoTrack?: any;
  localScreenTrack?: any;
  remoteScreenTrack?: any;
  isLocalScreenSharing?: boolean;
}

const CallParticipantList = ({
  isFullScreen = false,
  chatScreenShareLayout = false,
  data,
  localVideoTrack,
  localScreenTrack,
  remoteScreenTrack,
  isLocalScreenSharing,
}: CallParticipantListProps) => {
  const remoteParticipants = data || [];

  const sortedParticipants = [...(remoteParticipants || [])].sort((a, b) => {
    // Pinned participants come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Participants with raised hands come next
    if (a.handsRaised && !b.handsRaised) return -1;
    if (!a.handsRaised && b.handsRaised) return 1;

    // Participants with video come next
    const aHasVideo = Boolean(a.videoTrack);
    const bHasVideo = Boolean(b.videoTrack);
    if (aHasVideo && !bHasVideo) return -1;
    if (!aHasVideo && bHasVideo) return 1;

    // Participants with audio track (proxy for ability to talk)
    const aHasAudio = Boolean(a.audioTrack);
    const bHasAudio = Boolean(b.audioTrack);
    if (aHasAudio && !bHasAudio) return -1;
    if (!aHasAudio && bHasAudio) return 1;

    return 0;
  });

  // If a remote user is sharing screen, hide their video from the grid to avoid duplication
  let participants = sortedParticipants;
  const activeScreenTrack = isLocalScreenSharing
    ? localScreenTrack
    : remoteScreenTrack;
  const hasScreenShare = !!activeScreenTrack;

  // Find the screen sharer (remote)
  let screenSharerUid = null;
  if (!isLocalScreenSharing && remoteScreenTrack) {
    // Try to find the participant who is sharing screen
    const screenSharer = sortedParticipants.find(
      (p) =>
        p.screenSharing ||
        p.isScreenSharing ||
        p.screenTrack === remoteScreenTrack
    );
    screenSharerUid = screenSharer?.uid;
  }

  // Remove the presenter's video from the grid if they are sharing screen (remote)
  if (screenSharerUid) {
    participants = participants.filter((p) => p.uid !== screenSharerUid);
  }

  const showSideBySide = hasScreenShare && isFullScreen;
  const useChatScreenShareLayout = chatScreenShareLayout && showSideBySide;

  const isSolo = isFullScreen && participants.length === 1 && !hasScreenShare;
  const isDuo = isFullScreen && participants.length === 2 && !hasScreenShare;
  const isFullHeight = isSolo || isDuo;

  const participantsLayout = (
    <div
      className={`
        gap-3 p-1 min-h-0 w-full box-border
        ${
          isFullHeight
            ? `flex ${
                isSolo
                  ? "h-[calc(100vh-230px)] items-center justify-center"
                  : "h-[calc(100vh-230px)] flex-nowrap items-stretch justify-center"
              }`
            : `grid ${
                !isFullScreen
                  ? sortedParticipants.length <= 2
                    ? "grid-cols-1"
                    : "grid-cols-2"
                  : hasScreenShare
                    ? "grid-cols-1"
                    : sortedParticipants.length <= 2
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`
        }
      `}
    >
      {participants?.map((participant, index: number) => {
        const participantCard = (
          <BuzzParticipant
            audioTrack={participant?.audioTrack}
            videoTrack={participant?.videoTrack}
            name={participant?.username || `Remote User`}
            uid={participant?.uid}
            handsRaised={participant?.handsRaised}
            avatarUrl={participant?.avatarUrl}
            isPinned={participant?.isPinned}
            join_status={participant?.join_status}
            color={participant?.color}
            user_id={participant?.user_id}
            isFullHeight={isFullHeight}
          />
        );

        if (!isFullHeight) {
          return (
            <React.Fragment key={participant?.uid || index}>
              {participantCard}
            </React.Fragment>
          );
        }

        return (
          <div
            key={participant?.uid || index}
            className={
              isSolo ? "w-full h-full max-w-[1200px]" : "flex-1 h-full min-w-0"
            }
          >
            {participantCard}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={`h-full w-full transition-all duration-300 min-h-0 ${
        showSideBySide
          ? useChatScreenShareLayout
            ? "flex flex-row gap-4 items-stretch px-4"
            : "flex flex-row gap-4 items-stretch p-1"
          : "flex flex-col gap-2 p-1"
      }`}
    >
      {hasScreenShare && (
        <div
          className={`relative rounded-xl overflow-hidden bg-black ${
            showSideBySide
              ? useChatScreenShareLayout
                ? "flex-1 min-w-0 min-h-[70vh]"
                : "flex-[0_0_60%] min-w-0"
              : "w-full h-56 shrink-0"
          }`}
        >
          <ScreenSharePlayer
            videoTrack={activeScreenTrack}
            isLocal={isLocalScreenSharing}
          />
        </div>
      )}

      {isFullHeight && !showSideBySide ? (
        <div className="w-full flex-1 min-h-0 overflow-hidden">
          {participantsLayout}
        </div>
      ) : (
        <ScrollArea
          className={`
            ${
              showSideBySide
                ? useChatScreenShareLayout
                  ? "w-[280px] shrink-0 min-h-[70vh] h-full overflow-x-hidden"
                  : "flex-[0_0_40%] min-w-[280px] max-w-[480px] h-[70vh] order-1"
                : "w-full flex-1"
            }
          `}
        >
          {participantsLayout}
        </ScrollArea>
      )}
    </div>
  );
};

export default CallParticipantList;
