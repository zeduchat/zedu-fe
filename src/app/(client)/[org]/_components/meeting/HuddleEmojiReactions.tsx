"use client";

import React, { useState, useRef, useCallback, useContext } from "react";
import Picker from "~/components/theme/themed-emoji-picker";
import data from "@emoji-mart/data";
import { MoreHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { PostRequest } from "~/utils/new-request";
import { useParams } from "next/navigation";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  name: string;
  jitter: number;
}

type HuddleEmojiReactionsProps = {
  name: string;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const QUICK_EMOJIS = ["❤️", "👍", "🎉", "👏", "😂", "😮", "😢", "🤔", "👎"];

const HuddleEmojiReactions = ({
  name,
  children,
  isOpen,
  setIsOpen,
}: HuddleEmojiReactionsProps) => {
  const [showFullPicker, setShowFullPicker] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const { id: buzzId } = useParams();
  const { state, dispatch } = useContext(DataContext);
  const { floatingEmojis, user } = state;
  // Inside HuddleEmojiReactions
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleEmojiSelect = useCallback(
    async (emoji: string, senderName: string, buttonElement?: HTMLElement) => {
      const rect = buttonElement?.getBoundingClientRect();
      if (!rect) return;

      clickCountRef.current += 1;

      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1000);

      const isBursting = clickCountRef.current > 5;
      const spawnAmount = isBursting ? 3 : 1;

      for (let i = 0; i < spawnAmount; i++) {
        const id = Date.now() + Math.random();
        const newEmoji: FloatingEmoji = {
          id,
          emoji,
          x: rect.left + rect.width / 2,
          y: rect.top,
          name: senderName,
          jitter: (Math.random() - 0.5) * (isBursting ? 200 : 60),
        };

        dispatch({ type: ACTIONS.ADD_FLOATING_EMOJI, payload: newEmoji });

        // Fixed 3s cleanup to match CSS
        setTimeout(() => {
          dispatch({ type: ACTIONS.REMOVE_FLOATING_EMOJI, payload: id });
        }, 3000);
      }

      if (clickCountRef.current % 3 === 1 || !isBursting) {
        try {
          PostRequest(`/buzz/${buzzId}/reaction`, {
            reaction_type: "emoji",
            content: emoji,
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [buzzId, dispatch]
  );

  const handleQuickEmojiClick = (
    emoji: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    handleEmojiSelect(emoji, name, event.currentTarget);
  };

  const handleEmojiPickerSelect = (emoji: any) => {
    handleEmojiSelect(emoji.native, name, moreButtonRef.current as HTMLElement);
    setShowFullPicker(false);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {floatingEmojis?.map((item: FloatingEmoji) => (
          <div
            key={item.id}
            className="absolute flex flex-col items-center justify-center animate-float-up-fade"
            style={
              {
                left: `${item.x}px`,
                top: `${item.y}px`,
                "--jitter": `${item.jitter}px`,
                // '--duration': `${item.duration}s`,
              } as React.CSSProperties
            }
          >
            <span className="text-5xl leading-none filter drop-shadow-md">
              {item.emoji}
            </span>
            <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full mt-1 whitespace-nowrap backdrop-blur-sm">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>

        <PopoverContent
          side="top"
          align="center"
          sideOffset={12}
          className="w-auto p-2 bg-[#3c4043] rounded-full shadow-2xl border-none flex items-center gap-1 z-[80]"
        >
          {QUICK_EMOJIS.map((emoji, index) => (
            <button
              key={index}
              onClick={(e) => handleQuickEmojiClick(emoji, e)}
              className="text-lg hover:bg-[#202124] rounded-full p-2 transition-all hover:scale-85 active:scale-85"
            >
              {emoji}
            </button>
          ))}

          <Popover open={showFullPicker} onOpenChange={setShowFullPicker}>
            <PopoverTrigger asChild>
              <button
                ref={moreButtonRef}
                className="text-gray-500 hover:bg-gray-100 rounded-full p-2 transition-all"
              >
                <MoreHorizontal size={20} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="p-0 border-none shadow-none z-[90]"
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiPickerSelect}
                previewPosition="none"
              />
            </PopoverContent>
          </Popover>
        </PopoverContent>
      </Popover>

      <style jsx>{`
        @keyframes float-up-fade {
          0% {
            opacity: 1;
            transform: translate3d(-50%, 0, 0) scale(1);
          }
          80% {
            opacity: 1; /* Stay solid longer so name is readable */
          }
          100% {
            opacity: 0;
            transform: translate3d(calc(-50% + var(--jitter)), -85vh, 0)
              scale(0.7);
          }
        }
        .animate-float-up-fade {
          animation: float-up-fade 3s cubic-bezier(0.1, 0, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>
    </>
  );
};

export default HuddleEmojiReactions;
