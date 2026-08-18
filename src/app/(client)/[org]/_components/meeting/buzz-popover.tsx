"use client";

import React, { useContext, useState } from "react";
import { Copy, Info, X, UserPlus } from "lucide-react";
import Tooltips from "../tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { useParams } from "next/navigation";
import { DataContext } from "~/store/GlobalState";
import { showInfo } from "~/components/toast/sonner";
import { InviteModal } from "./buzzInviteModal";

interface BuzzPopoverProps {
  trigger?: React.ReactNode;
}

export default function BuzzPopover({ trigger }: BuzzPopoverProps) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { id } = useParams();
  const { state } = useContext(DataContext);
  const url = window.location.href;

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    showInfo("Meeting link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {trigger || (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-none text-inherit font-inherit p-0 hover:text-white transition-colors"
            >
              <span className="tabular-nums">{id}</span>
              <Tooltips text="Buzz information" side="bottom">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/50 opacity-80 hover:opacity-100">
                  <Info size={10} strokeWidth={2.5} />
                </span>
              </Tooltips>
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={12}
          className="w-[calc(100vw-32px)] sm:w-[420px] p-0 rounded-[24px] border-none bg-[#F8F9FB] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-[22px] font-semibold text-[#1B1F24] tracking-tight">
              Your buzz is ready
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-gray-200/60 text-gray-500"
            >
              <X size={20} strokeWidth={2.5} />
            </Button>
          </div>

          <div className="px-6 pb-8 space-y-5">
            {/* Action Button */}
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-[#7C00FE] hover:bg-[#6600D1] text-white rounded-full px-5 py-2 h-auto flex items-center gap-2 transition-transform active:scale-95 shadow-sm"
            >
              <UserPlus size={18} strokeWidth={2.5} />
              <span className="font-medium text-[14px]">Add Others</span>
            </Button>

            {/* Prompt */}
            <p className="text-[#32383F] text-[16px] leading-[1.45]">
              Or share this meeting link with others that you want in the
              meeting
            </p>

            {/* Copy Input Area */}
            <div className="flex items-center justify-between bg-[#ECEFF3] px-4 py-4 rounded-[8px] group transition-colors hover:bg-[#e2e6eb]">
              <span className="text-[#1B1F24] font-medium text-[17px] truncate select-all">
                {url}
              </span>
              <button
                onClick={onCopy}
                className="ml-3 text-[#32383F] hover:text-black transition-colors shrink-0"
              >
                <Copy size={22} className={copied ? "text-green-600" : ""} />
              </button>
            </div>

            {/* Permission Section */}
            <div className="flex items-start gap-4 pt-1">
              <div className="shrink-0 pt-0.5">
                {/* Custom Icon Box to match the Lock+Eye in design */}
                <div className="relative w-10 h-10 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                  <div className="relative">
                    <span className="text-xl">🔒</span>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white mt-1 shadow-sm" />
                  </div>
                </div>
              </div>
              <p className="text-[#626d79] text-[14.5px] leading-[1.3] font-normal">
                People who use this buzz link must get your permission before
                they can join.
              </p>
            </div>

            {/* Identity Footer */}
            <div className="pt-1">
              <p className="text-[#626d79] text-[14.5px]">
                Joined as{" "}
                <span className="text-[#1B1F24] font-medium">
                  {state.user?.username}
                </span>
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <InviteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
