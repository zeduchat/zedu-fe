"use client";

import React, { useContext, useState } from "react";
import {
  Link2,
  MessageCircleMore,
  Mic,
  Mic2Icon,
  MicOff,
  MoreVertical,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { InviteModal } from "./buzzInviteModal";
import { showInfo } from "~/components/toast/sonner";
import { PostRequest } from "~/utils/new-request";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { updateRecordingLayout } from "~/lib/buzz/update-recording-layout";
import { useChannelBuzzContext } from "~/hooks/buzz/ChannelBuzzContext";

interface BuzzPopoverMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}

interface BuzzPopoverMenuSection {
  items: BuzzPopoverMenuItem[];
  divider?: boolean;
  hide?: boolean;
}

interface BuzzMenuProps {
  buzzLoading?: boolean;
  readOnlyUi?: boolean;
  setShowParticipant: (show: boolean) => void;
  setShowBuzzChat: (show: boolean) => void;
}

export function BuzzMenu({
  buzzLoading,
  readOnlyUi,
  setShowParticipant,
  setShowBuzzChat,
}: BuzzMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const { buzzData, user, buzzIsScreenSharing, buzzAgoraUintUids } = state;
  const { isVideoPublishing } = useChannelBuzzContext();

  const isHost = String(buzzData?.host_id) === String(user?.user_id);

  const copyToClipboard = async () => {
    if (readOnlyUi) {
      setIsOpen(false);
      return;
    }

    try {
      const url = window.location.href;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      showInfo("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    } finally {
      setIsOpen(false);
    }
  };

  const handleRecording = async () => {
    if (readOnlyUi) {
      setIsOpen(false);
      return;
    }

    if (!buzzData?.is_recording) {
      dispatch({ type: ACTIONS.BUZZ_STARTING_RECORDING, payload: true });
      try {
        const res = await PostRequest(
          `/buzz/${buzzData?.buzz_id}/recording/start`,
          {}
        );
        if (res?.status === 200 || res?.status === 201) {
          dispatch({
            type: ACTIONS.BUZZ_DATA,
            payload: {
              ...buzzData,
              is_recording: true,
            },
          });
          if (buzzIsScreenSharing) {
            await updateRecordingLayout(
              buzzData?.buzz_id,
              buzzAgoraUintUids?.screenShareUintUid,
              isVideoPublishing ? buzzAgoraUintUids?.cameraUintUid : undefined,
              isVideoPublishing
            );
          }
          showInfo("Recording started");
        }
      } finally {
        dispatch({ type: ACTIONS.BUZZ_STARTING_RECORDING, payload: false });
      }
    } else {
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
    }

    setIsOpen(false);
  };

  const handleMute = async () => {
    if (readOnlyUi) {
      setIsOpen(false);
      return;
    }

    await PostRequest(`/buzz/${buzzData?.buzz_id}/mute-participants`, {});

    setIsOpen(false);
  };

  const menuSections: BuzzPopoverMenuSection[] = [
    {
      items: [
        {
          id: "invite people",
          label: "Invite People",
          icon: <Plus size={20} className="text-white" />,
          onClick: () => {
            if (readOnlyUi) {
              setIsOpen(false);
              return;
            }
            setModalOpen(true);
            setIsOpen(false);
          },
        },
      ],
      divider: true,
    },
    {
      items: [
        {
          id: "chat",
          label: "Chat",
          icon: <MessageCircleMore size={20} className="text-white" />,
          onClick: () => {
            setShowBuzzChat(true);
            setShowParticipant(false);
            setIsOpen(false);
          },
        },
        {
          id: "buzz participants",
          label: "Buzz Participants",
          icon: <Users size={20} className="text-white" />,
          onClick: () => {
            setShowParticipant(true);
            setShowBuzzChat(false);
            setIsOpen(false);
          },
        },
      ],
      divider: true,
    },
    {
      items: [
        {
          id: "Copy buzz link",
          label: "Copy buzz link",
          icon: <Link2 size={20} className="text-white -rotate-45" />,
          onClick: copyToClipboard,
        },
      ],
      divider: true,
    },
    {
      hide: !isHost,
      items: [
        {
          id: "Record",
          label: buzzData?.is_recording ? "Stop recording" : "Start recording",
          icon: <Mic2Icon size={20} className="text-white" />,
          onClick: () => {
            handleRecording();
            setIsOpen(false);
          },
        },
      ],
      divider: true,
    },
    {
      hide: !isHost,
      items: [
        {
          id: "Mute participants",
          label: "Mute participants",
          icon: <MicOff size={20} className="text-white" />,
          onClick: () => {
            handleMute();
            setIsOpen(false);
          },
        },
      ],
    },
  ];

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={buzzLoading}
            className={cn(
              "p-1.5 sm:p-2 rounded-md w-8 h-8 sm:w-9 sm:h-9 border border-[#E4E7EC] flex items-center justify-center transition-colors flex-shrink-0",
              buzzLoading && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            <MoreVertical size={16} className="text-white" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-64 p-0 bg-[#3c4043] border-none z-[100]"
          align="end"
          side="top"
          sideOffset={12}
        >
          <div className="py-2">
            {menuSections
              .filter((section) => !section.hide)
              .map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!item.disabled) item.onClick();
                      }}
                      disabled={item.disabled}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 text-sm transition-colors",
                        "hover:bg-[#434649] active:bg-[#434649] cursor-pointer",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        item.variant === "danger"
                          ? "text-red-500"
                          : "text-white"
                      )}
                    >
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-white">
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left font-normal">
                        {item.label}
                      </span>
                    </button>
                  ))}
                  {section.divider &&
                    sectionIndex !== menuSections.length - 1 && (
                      <div className="h-[1px] bg-white/10 my-1 mx-2" />
                    )}
                </React.Fragment>
              ))}
          </div>
        </PopoverContent>
      </Popover>

      <InviteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
