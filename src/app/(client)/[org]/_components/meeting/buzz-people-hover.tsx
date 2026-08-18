"use client";

import React, { useContext, useRef, useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import images from "~/assets/images";
import { DataContext } from "~/store/GlobalState";
import { filterVisibleParticipants } from "~/lib/buzz/session";
import { cn } from "~/lib/utils";
import { InviteModal } from "./buzzInviteModal";
import { PostRequest } from "~/utils/new-request";
import { showInfo } from "~/components/toast/sonner";

interface BuzzPeopleHoverProps {
  onViewAll: () => void;
  readOnlyUi?: boolean;
}

const BuzzPeopleHover = ({
  onViewAll,
  readOnlyUi = false,
}: BuzzPeopleHoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { state } = useContext(DataContext);
  const { user, buzzParticipants = [], buzzData } = state;

  const visibleParticipants = filterVisibleParticipants(buzzParticipants);
  const participantCount = visibleParticipants.length;
  const isHost = String(buzzData?.host_id) === String(user?.user_id);

  const avatarSrc =
    (user?.avatar_url && user.avatar_url.length > 5
      ? user.avatar_url
      : user?.default_avatar_url) || images.user;

  const displayName = user?.username || user?.name || "You";
  const joinedLabel =
    participantCount === 1
      ? "Just you"
      : `${participantCount} people in the call`;

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 120);
  };

  const handleMuteAll = async () => {
    if (readOnlyUi || !isHost) return;
    await PostRequest(`/buzz/${buzzData?.buzz_id}/mute-participants`, {});
    showInfo("All participants muted");
  };

  return (
    <>
      <div
        className="relative"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <button
          type="button"
          className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="People in this call"
        >
          <Image
            src={avatarSrc}
            alt={displayName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover border border-white/20"
          />
          {participantCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#3c4043] px-1 text-[11px] font-medium text-white ring-2 ring-[#202124]">
              {participantCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div
            className="absolute right-0 top-full z-[60] mt-3 w-[300px] rounded-2xl border border-zinc-700/80 bg-[#3c4043] p-4 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <h3 className="mb-4 text-[15px] font-normal text-white">People</h3>

            {!readOnlyUi && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mb-3 w-full rounded-full bg-[#a8c7fa] px-4 py-2.5 text-sm font-medium text-[#041e49] transition-colors hover:bg-[#93b8f7]"
              >
                Add people
              </button>
            )}

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={handleMuteAll}
                disabled={readOnlyUi || !isHost}
                className={cn(
                  "rounded-full border border-zinc-500/70 px-3 py-1.5 text-xs text-zinc-200 transition-colors",
                  isHost && !readOnlyUi
                    ? "hover:bg-zinc-600/50"
                    : "cursor-not-allowed opacity-50"
                )}
              >
                All muted
              </button>
              {/* <button
                                type="button"
                                disabled={!isHost || readOnlyUi}
                                onClick={onViewAll}
                                className={cn(
                                    "rounded-full border border-zinc-500/70 px-3 py-1.5 text-xs text-zinc-200 transition-colors",
                                    isHost && !readOnlyUi
                                        ? "hover:bg-zinc-600/50"
                                        : "cursor-not-allowed opacity-50"
                                )}
                            >
                                Host controls
                            </button> */}
            </div>

            <div className="rounded-xl bg-[#2d2f31] px-3 py-3">
              <p className="text-sm text-zinc-300">{participantCount} joined</p>
              <p className="text-xs text-zinc-500">{joinedLabel}</p>
              <div className="mt-3 flex items-center gap-2">
                <Image
                  src={avatarSrc}
                  alt={displayName}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="truncate text-sm text-zinc-200">
                  {displayName}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onViewAll();
                setIsOpen(false);
              }}
              className="mt-4 flex w-full items-center justify-center gap-0.5 text-sm text-zinc-300 transition-colors hover:text-white"
            >
              View everyone in this call
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <InviteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default BuzzPeopleHover;
