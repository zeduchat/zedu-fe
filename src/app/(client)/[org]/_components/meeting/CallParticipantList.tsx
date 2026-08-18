import { BuzzParticipant } from "./CallParticipant";
import { ScreenSharePlayer } from "./screen-share-player";
import { ScrollArea } from "~/components/ui/scroll-area";

interface CallParticipantListProps {
  data?: any[];
  localVideoTrack?: any;
  localScreenTrack?: any;
  remoteScreenTrack?: any;
  isLocalScreenSharing?: boolean;
}

const CallParticipantList = ({
  data,
  localVideoTrack,
  localScreenTrack,
  remoteScreenTrack,
  isLocalScreenSharing,
}: CallParticipantListProps) => {
  const remoteParticipants = data || [];

  // Only show screen share if the track is not the same as the local video track
  const isScreenTrackValid = (track: any) => {
    if (!track) return false;
    // If localVideoTrack and localScreenTrack are the same, don't show as screen share
    if (isLocalScreenSharing && localScreenTrack === localVideoTrack)
      return false;
    return true;
  };

  const activeScreenTrack = isLocalScreenSharing
    ? isScreenTrackValid(localScreenTrack)
      ? localScreenTrack
      : null
    : isScreenTrackValid(remoteScreenTrack)
      ? remoteScreenTrack
      : null;

  const hasScreenShare = !!activeScreenTrack;

  const sortedParticipants = [...remoteParticipants].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.handsRaised && !b.handsRaised) return -1;
    if (!a.handsRaised && b.handsRaised) return 1;

    const aHasVideo = Boolean(a.videoTrack);
    const bHasVideo = Boolean(b.videoTrack);
    if (aHasVideo && !bHasVideo) return -1;
    if (!aHasVideo && bHasVideo) return 1;

    return 0;
  });

  const showSideBySide = hasScreenShare;
  const isSolo = sortedParticipants.length === 1 && !hasScreenShare;
  const isDuo = sortedParticipants.length === 2 && !hasScreenShare;
  const isFullHeight = isSolo || isDuo;

  return (
    <div
      className={`h-full w-full overflow-hidden transition-all duration-300 ${
        showSideBySide
          ? "flex flex-col lg:flex-row gap-4 items-stretch"
          : "flex flex-col gap-2"
      }`}
    >
      {/* SCREEN SHARE VIEWPORT */}
      {hasScreenShare && (
        <div
          className={`relative rounded-xl overflow-hidden bg-black shadow-2xl ${
            showSideBySide
              ? "flex-[0_0_72%] min-w-0 h-full"
              : "w-full h-56 shrink-0"
          }`}
        >
          <ScreenSharePlayer
            videoTrack={activeScreenTrack}
            isLocal={isLocalScreenSharing}
          />
        </div>
      )}

      {/* PARTICIPANTS GRID */}
      <ScrollArea
        className={`
          ${
            showSideBySide
              ? "flex-1 lg:flex-[0_0_28%] min-w-[260px] h-full order-1 overflow-x-hidden"
              : "w-full flex-1"
          }
          ${isFullHeight ? "flex items-center justify-center overflow-hidden" : ""}
        `}
      >
        <div
          className={`
    flex gap-3 min-h-0 w-full box-border
    ${showSideBySide ? "pr-3" : ""}
    ${
      isSolo
        ? "h-[calc(100vh-230px)] items-center justify-center"
        : isDuo
          ? "h-[calc(100vh-230px)] flex-nowrap items-stretch justify-center"
          : "flex-wrap content-start"
    }
  `}
        >
          {sortedParticipants?.map((participant: any, index: number) => (
            <div
              key={participant.uid || index}
              className={` 
                  transition-all duration-300 shrink-0 grow min-w-0
                  ${
                    isSolo
                      ? "w-full h-full max-w-[1200px]"
                      : isDuo
                        ? "flex-1 h-full min-w-0"
                        : hasScreenShare
                          ? "w-full max-w-[320px] mx-auto"
                          : "w-full sm:flex-[1_1_45%] md:flex-[1_1_30%] lg:flex-[1_1_22%]"
                  }
      `}
            >
              <BuzzParticipant
                audioTrack={participant?.audioTrack}
                videoTrack={participant?.videoTrack}
                name={participant?.username || participant?.full_name || `User`}
                uid={participant?.uid}
                handsRaised={participant?.handsRaised}
                avatarUrl={participant?.avatar_url}
                isPinned={participant?.isPinned}
                isSolo={isSolo}
                color={participant?.color}
                user_id={participant?.user_id}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CallParticipantList;
