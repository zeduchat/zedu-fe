/* eslint-disable no-unused-vars */
"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export interface BuzzPopoverMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}

export interface BuzzPopoverMenuSection {
  items: BuzzPopoverMenuItem[];
  divider?: boolean; // Show divider after this section
}

interface BuzzPopoverProps {
  sections: BuzzPopoverMenuSection[];
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  side?: "right" | "bottom" | "left";
}

export function BuzzPopover({
  sections,
  children,
  align = "end",
  side = "bottom",
  ...popoverProps
}: BuzzPopoverProps) {
  return (
    <Popover {...popoverProps}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 bg-[white] border-[#e5e5e5] shadow-xl"
        align={align}
        side={side}
        sideOffset={8}
      >
        <div className="py-2">
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                    }
                  }}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 text-sm transition-colors",
                    "hover:bg-[#e5e5e5] active:bg-[#e5e5e5] cursor-pointer",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                    item.variant === "danger"
                      ? "text-red-400 hover:text-red-300"
                      : "text-black"
                  )}
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left font-normal">
                    {item.label}
                  </span>
                </button>
              ))}
              {section.divider && sectionIndex < sections.length - 1 && (
                <div className="my-2 border-t border-[#e5e5e5]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
