"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useContextSelector } from "use-context-selector";
import Picker from "~/components/theme/themed-emoji-picker";
import data from "@emoji-mart/data";
import { MoreHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";

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
  showQuickEmojis?: boolean;
};

const QUICK_EMOJIS = ["❤️", "👍", "🎉", "👏", "😂", "😮", "😢", "🤔", "👎"];

const HuddleEmojiReactions = ({
  name,
  showQuickEmojis,
}: HuddleEmojiReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useContext(DataContext);
  const { floatingEmojis, buzzData, buzzSidebar } = state;

  const moreButtonRef = useRef<HTMLButtonElement>(null);

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
          await PostRequest(`/buzz/${buzzData?.buzz_id}/reaction`, {
            reaction_type: "emoji",
            content: emoji,
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [buzzData?.buzz_id, dispatch]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    }

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const handleQuickEmojiClick = (
    emoji: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    handleEmojiSelect(emoji, name, event.currentTarget);
  };

  const handleEmojiPickerSelect = (emoji: any) => {
    handleEmojiSelect(emoji.native, name, moreButtonRef.current as HTMLElement);
    setShowPicker(false);
  };

  return (
    <>
      {/* <div className="fixed inset-0 pointer-events-none z-[70]"> */}
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
      {/* </div> */}

      <div
        className={
          `absolute bottom-14 ${buzzSidebar ? "left-1/2" : "left-1/3"} -translate-x-1/2 z-[70]` +
          (showQuickEmojis ? "" : " hidden")
        }
      >
        <div className="bg-primary-50 backdrop-blur-sm rounded-full px-2 py-2 shadow-2xl border border-primary-50 flex items-center gap-1">
          {QUICK_EMOJIS.map((emoji, index) => (
            <button
              key={index}
              onClick={(e) => handleQuickEmojiClick(emoji, e)}
              className="text-lg hover:bg-primary-100 rounded-full p-2 transition-all hover:scale-85 active:scale-85"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <Popover open={showPicker} onOpenChange={setShowPicker}>
            <PopoverTrigger asChild>
              <button
                ref={moreButtonRef}
                onClick={() => setShowPicker(!showPicker)}
                className={`
                text-gray-500 hover:bg-primary-100 rounded-full p-2.5
                transition-all hover:scale-110 active:scale-95
                ${showPicker ? "bg-primary-50 text-primary-100" : ""}
              `}
                title="More reactions"
              >
                <MoreHorizontal size={24} />
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="end"
              className="bg-gray-800 border border-gray-700 rounded-xl p-0 shadow-2xl z-[80]"
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiPickerSelect}
                previewPosition="none"
                skinTonePosition="search"
                searchPosition="sticky"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up-fade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(-200px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-100vh) scale(0.5);
          }
        }

        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.7) translateY(10px);
          }
          25% {
            opacity: 1;
            transform: scale(0.8) translateY(7px);
          }
          50% {
            opacity: 1;
            transform: scale(0.9) translateY(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-float-up-fade {
          animation: float-up-fade 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)
            forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default HuddleEmojiReactions;
