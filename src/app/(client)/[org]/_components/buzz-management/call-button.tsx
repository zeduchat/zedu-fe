"use client";

import React from "react";
import { HeadphonesIcon, Phone } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { cn } from "~/lib/utils";
import Loading from "~/components/ui/loading";

export type CallButtonProps = {
  onClick: (e: React.FormEvent) => Promise<void>;
  isActive?: boolean;
  className?: string;
  tooltipText?: string;
  startLoading?: boolean;
  joinLoading?: boolean;
};

export const CallButton: React.FC<CallButtonProps> = ({
  onClick,
  isActive = false,
  className = "",
  tooltipText,
  startLoading = false,
  joinLoading = false,
}) => {
  const computedTooltip =
    tooltipText ?? (isActive ? "Join ongoing buzz" : "Start a buzz");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-4 h-9 rounded-md font-medium transition-all duration-150 active:scale-95 relative border",
              isActive
                ? "bg-primary-500 border-primary-500 text-white shadow-md hover:bg-primary-400"
                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-transparent dark:border-zinc-500 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white",
              className
            )}
          >
            {startLoading || joinLoading ? (
              <Loading color={isActive ? "white" : "black"} />
            ) : (
              <HeadphonesIcon
                size={16}
                className={
                  isActive ? "text-white" : "text-zinc-700 dark:text-zinc-100"
                }
              />
            )}
            <span className="text-sm">
              {isActive ? "Join Buzz" : "Start Buzz"}
            </span>

            {isActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00AD51] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00AD51] ring-2 ring-white"></span>
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white p-2 rounded-md text-sm border-none">
          <TooltipArrow className="fill-black" />
          <span>{computedTooltip}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CallButton;
