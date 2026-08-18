// components/CopyToClipboardWithTooltip.tsx

"use client";

import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface CopyToClipboardWithTooltipProps {
  textToCopy: string;
  tooltipText?: string;
  children: React.ReactNode;
}

export function CopyToClipboardWithTooltip({
  textToCopy,
  tooltipText = "Copied",
  children,
}: CopyToClipboardWithTooltipProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={copied}>
        <TooltipTrigger asChild>
          <div onClick={handleCopy} className="cursor-pointer inline-flex">
            {children}
          </div>
        </TooltipTrigger>

        <TooltipContent side="top" className="bg-black text-white">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
