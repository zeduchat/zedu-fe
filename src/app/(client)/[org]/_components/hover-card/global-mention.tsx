"use client";

import { useState, useRef, useContext } from "react";
import * as Popover from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { DataContext } from "~/store/GlobalState";
import UserHoverCardContent from "./mention";
import ChannelHoverCardContent from "./channel";

interface GlobalMentionProps {
  id: string;
  trigger: "@" | "#";
  label: string;
  item: any;
  currentUser?: any;
}

const normalizeMentionValue = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

const isCurrentUserMention = (id: string, label: string, currentUser?: any) => {
  if (!currentUser) return false;

  if (id && String(id) === String(currentUser.id)) {
    return true;
  }

  const normalizedLabel = normalizeMentionValue(label);
  if (!normalizedLabel) return false;

  return [currentUser.username, currentUser.name, currentUser.email].some(
    (value) => normalizeMentionValue(value) === normalizedLabel
  );
};

export default function GlobalMention({
  id,
  trigger,
  label,
  item,
  currentUser,
}: GlobalMentionProps) {
  const { state } = useContext(DataContext);
  const loggedInUser = currentUser ?? state?.user;
  const isSelfMention =
    trigger === "@" && isCurrentUserMention(id, label, loggedInUser);

  const [open, setOpen] = useState(false);
  const openTimer = useRef<NodeJS.Timeout | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), 400);
  };

  const handleMouseLeave = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={
            isSelfMention
              ? "text-[#1264a3] bg-[#fff3b0] hover:bg-[#ffe566] px-1 rounded cursor-pointer transition-colors font-medium inline-flex items-center mx-[1px]"
              : "text-[#1264a3] bg-[#e8f0fe] hover:bg-[#d0e2ff] px-1 rounded cursor-pointer transition-colors font-medium inline-flex items-center mx-[1px]"
          }
        >
          {trigger}
          {label}
        </span>
      </PopoverTrigger>

      <PopoverContent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sideOffset={5}
        side="top"
        align="start"
        className="z-[100] rounded-xl border border-gray-200 bg-white shadow-xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {trigger === "@" ? (
          <UserHoverCardContent userId={id} />
        ) : (
          <ChannelHoverCardContent channelId={id} />
        )}
      </PopoverContent>
    </Popover.Root>
  );
}
