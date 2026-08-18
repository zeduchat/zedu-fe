"use client";

import {
  Hand,
  Loader,
  MessageCircleMore,
  Mic,
  MicOff,
  MonitorOff,
  ScreenShare,
  Smile,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import { RaiseHandAnimation } from "~/components/raise-hand/raise-hand-animation";
import HuddleEmojiReactions from "./HuddleEmojiReactions";
import CallParticipantList from "./CallParticipantList";
import { BuzzMenu } from "./buzz-menu";
import { useParams } from "next/navigation";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { showInfo } from "~/components/toast/sonner";
import { cn } from "~/lib/utils";
import ParticipantSidebar from "./participant-sidebar";
import ChatSidebar from "./buzz-chat";
import BuzzTopBar from "./buzz-top-bar";
import BuzzTimeout from "./buzz-timeout";
import GeneralTimeout from "./general-timeout";
import { useAgoraEvents } from "~/hooks/buzz";
import { useChannelBuzzContext } from "~/hooks/buzz/ChannelBuzzContext";
import {
  filterVisibleParticipants,
  RECORDER_SESSION_MODE,
} from "~/lib/buzz/session";

interface MeetingRoomProps {
  initialMic?: boolean;
  initialVideo?: boolean;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({
  initialMic,
  initialVideo,
}) => {
  const { state, dispatch } = useContext(DataContext);
  const { user, buzzParticipants, buzzSessionMode } = state;
  const isRecorderView = buzzSessionMode === RECORDER_SESSION_MODE;
  const visibleParticipants = filterVisibleParticipants(buzzParticipants);
  const noop = useCallback(() => undefined, []);

  const [showQuickEmojis, setShowQuickEmojis] = useState(false);
  const { id } = useParams() as { id: string };

  // Use the useBuzz hook for all media and state management
  const {
    videoTrack,
    screenVideoTrack,
    remoteScreenVideoTrack,
    isAudioPublishing,
    isVideoPublishing,
    isScreenSharing,
    isInitialized,
    joined,
    joining,
    showParticipant,
    showBuzzchat,
    clientRef,
    screenShareClientRef,
    toggleParticipantSidebar,
    toggleChatSidebar,
    startAudio,
    startVideo,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,
    handleLeave: handleLeaveBuzz,
    setShowParticipant,
    setShowBuzzchat,
    setRemoteScreenVideoTrack,
    setRemoteScreenAudioTrack,
  } = useChannelBuzzContext();

  // Wrap the buzz leave handler to call onLeave
  const handleLeave = useCallback(async () => {
    await handleLeaveBuzz();
    dispatch({ type: ACTIONS.HAS_JOINED, payload: false });
  }, [handleLeaveBuzz]);

  // Auto-start audio/video if enabled after joining
  useEffect(() => {
    const handleAutoStart = async () => {
      if (isRecorderView) return;

      if (joined && isInitialized) {
        if (initialMic) {
          await startAudio();
        }
        if (initialVideo) {
          await startVideo();
        }
      }
    };
    handleAutoStart();
  }, [
    joined,
    isInitialized,
    initialMic,
    initialVideo,
    startAudio,
    startVideo,
    isRecorderView,
  ]);

  const localParticipant = buzzParticipants?.find(
    (p: any) => p?.user_id === user?.user_id
  );
  const isHandRaised = localParticipant?.handsRaised ?? false;

  useAgoraEvents({
    user,
    clientRef,
    screenShareClientRef,
    isInitialized,
    data: buzzParticipants,
    setData: (val: any) => {
      const nextState = typeof val === "function" ? val(buzzParticipants) : val;
      dispatch({ type: ACTIONS.BUZZ_PARTICIPANTS, payload: nextState });
    },
    showInfo,
    dispatch,
    setRemoteScreenVideoTrack,
    setRemoteScreenAudioTrack,
  });

  if (joining)
    return (
      <div className="h-[100dvh] bg-[#202124] flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 animate-pulse text-white font-medium">
          <Loader size={20} className="mx-auto animate-spin text-white" />
          Preparing your meeting...
        </div>
      </div>
    );

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#202124] overflow-hidden transition-all duration-300 ease-in-out">
      {/* Header */}
      <BuzzTopBar
        readOnlyUi={isRecorderView}
        onViewAllPeople={() => {
          setShowParticipant(true);
          setShowBuzzchat(false);
        }}
      />

      {/* Middle section */}
      <div className="flex flex-1 min-h-0 w-full">
        <div className="flex flex-1 min-w-0 min-h-0 p-4 pb-2">
          <main className="flex-1 w-full flex items-center justify-center overflow-hidden">
            <div className="w-full h-full max-w-[1600px] mx-auto overflow-hidden">
              <CallParticipantList
                data={visibleParticipants}
                localVideoTrack={videoTrack}
                localScreenTrack={screenVideoTrack}
                remoteScreenTrack={remoteScreenVideoTrack}
                isLocalScreenSharing={isScreenSharing}
              />
            </div>
          </main>
        </div>

        {/* Sidebars Container */}
        <aside
          className={cn(
            "fixed right-0 z-[30] transition-all duration-500 ease-in-out bg-[#202124] border-l border-zinc-800",
            "lg:relative lg:z-0 lg:top-0",
            showParticipant || showBuzzchat
              ? "w-full sm:w-[360px] translate-x-0 top-0 bottom-0 lg:top-0"
              : "w-0 translate-x-full lg:translate-x-0 lg:w-0 top-0 bottom-0 lg:top-0"
          )}
        >
          <div className="h-full w-full flex flex-col relative">
            <div
              className={cn(
                "h-full transition-opacity duration-300",
                showParticipant
                  ? "opacity-100 visible"
                  : "opacity-0 invisible hidden"
              )}
            >
              <ParticipantSidebar
                isOpen={showParticipant}
                onClose={() => setShowParticipant(false)}
              />
            </div>
            <div
              className={cn(
                "h-full transition-opacity duration-300",
                showBuzzchat
                  ? "opacity-100 visible"
                  : "opacity-0 invisible hidden"
              )}
            >
              <ChatSidebar
                isOpen={showBuzzchat}
                onClose={() => setShowBuzzchat(false)}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom section */}
      <footer className="shrink-0 w-full px-4 pb-4 pt-2 flex items-center justify-center z-50 bg-[#202124] border-t border-zinc-800/80 relative">
        {/* Center: Controls */}
        <div className="flex items-center gap-3">
          {/* Audio Toggle */}
          <button
            disabled={!joined}
            onClick={isRecorderView ? noop : toggleAudio}
            className={cn(
              "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all border",
              !isAudioPublishing
                ? "bg-[#ea4335] border-transparent"
                : "bg-[#3c4043] border-zinc-600 hover:bg-[#434649] text-white"
            )}
          >
            {!isAudioPublishing ? (
              <MicOff size={20} className="text-white" />
            ) : (
              <Mic size={20} className="text-white" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            disabled={!joined}
            onClick={isRecorderView ? noop : toggleVideo}
            className={cn(
              "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all border",
              !isVideoPublishing
                ? "bg-[#ea4335] border-transparent"
                : "bg-[#3c4043] border-zinc-600 hover:bg-[#434649] text-white"
            )}
          >
            {!isVideoPublishing ? (
              <VideoOff size={20} className="text-white" />
            ) : (
              <Video size={20} className="text-white" />
            )}
          </button>

          {/* Screen Share */}
          <button
            disabled={!joined}
            onClick={isRecorderView ? noop : toggleScreenShare}
            className={cn(
              "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#3c4043] border border-zinc-600 hover:bg-[#434649] transition-all",
              isScreenSharing ? "text-white" : "text-white"
            )}
          >
            {isScreenSharing ? (
              <ScreenShare size={20} />
            ) : (
              <MonitorOff size={20} />
            )}
          </button>

          {/* Reactions */}
          <div
            className={cn(
              "hidden sm:block",
              isRecorderView && "pointer-events-none"
            )}
          >
            <HuddleEmojiReactions
              name={localParticipant?.username}
              isOpen={showQuickEmojis}
              setIsOpen={setShowQuickEmojis}
            >
              <button className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#3c4043] border border-zinc-600 hover:bg-[#434649] text-white">
                <Smile size={20} />
              </button>
            </HuddleEmojiReactions>
          </div>

          {/* Hand Raise */}
          <div className="relative">
            <button
              disabled={!joined}
              onClick={isRecorderView ? noop : toggleHandRaise}
              className={cn(
                "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border transition-all",
                isHandRaised
                  ? "bg-blue-400 text-white border-transparent"
                  : "bg-[#3c4043] border-zinc-600 hover:bg-[#434649] text-white"
              )}
            >
              <Hand size={20} />
            </button>
            <div className="absolute bottom-full right-0 mb-2 pointer-events-none">
              <RaiseHandAnimation
                trigger={isHandRaised}
                position="bottom-right"
                useRelativePosition={true}
              />
            </div>
          </div>

          {/* More Menu */}
          <BuzzMenu
            readOnlyUi={isRecorderView}
            setShowParticipant={setShowParticipant}
            setShowBuzzChat={setShowBuzzchat}
          />

          {/* Leave Call */}
          <button
            disabled={!joined}
            onClick={isRecorderView ? noop : handleLeave}
            className="flex items-center justify-center w-12 h-10 md:w-16 md:h-12 rounded-full bg-[#ea4335] hover:bg-[#d93025] transition-all"
          >
            <Image
              src="/PhoneSlash.svg"
              alt="leave"
              width={24}
              height={24}
              className="brightness-0 invert"
            />
          </button>
        </div>

        {/* Side Actions */}
        <div className="hidden md:flex items-center gap-1 absolute right-4">
          <button
            onClick={toggleChatSidebar}
            className={cn(
              "p-3 rounded-full transition-colors",
              showBuzzchat
                ? "bg-blue-600 text-white"
                : "text-white hover:bg-zinc-800"
            )}
          >
            <MessageCircleMore size={22} />
          </button>
          <button
            onClick={toggleParticipantSidebar}
            className={cn(
              "flex items-center gap-1 p-3 rounded-full transition-colors",
              showParticipant
                ? "bg-blue-600 text-white"
                : "text-white hover:bg-zinc-800"
            )}
          >
            <Users size={22} />
            <span className="text-xs font-bold">
              {visibleParticipants.length || 0}
            </span>
          </button>
        </div>
      </footer>

      {!isRecorderView && (
        <>
          <BuzzTimeout handleLeave={handleLeave} />
          <GeneralTimeout handleLeave={handleLeave} />
        </>
      )}
    </div>
  );
};

export default MeetingRoom;
