"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "~/lib/utils";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";

interface BuzzChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatDemo: React.FC<BuzzChatProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useContext(DataContext);
  const { user, buzzChats, buzzData } = state;
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [buzzChats]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const newMessage = {
      content: inputValue.trim(),
    };

    const res = await PostRequest(
      `/buzz/${buzzData?.buzz_id}/message`,
      newMessage
    );

    setInputValue("");
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] w-[380px] max-w-full bg-white z-[1000] transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center p-4 border-gray-200">
        <h2 className="text-lg font-semibold text-[#101828]">Chat Area</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar flex flex-col-reverse gap-4"
      >
        {buzzChats?.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center">
            No chat messages yet
          </p>
        ) : (
          [...buzzChats].reverse().map((msg: any) => {
            const isLocal = msg.user_id === user?.user_id;
            return (
              <div
                key={msg.created_at}
                className={cn(
                  "flex flex-col",
                  isLocal ? "items-end" : "items-start"
                )}
              >
                {!isLocal && (
                  <span className="text-[10px] text-zinc-500 mb-1 ml-1">
                    {msg.full_name}
                  </span>
                )}
                <div
                  className={cn(
                    "text-white px-4 py-2.5 rounded-2xl max-w-[85%]",
                    isLocal
                      ? "bg-[#004a77] rounded-tr-none"
                      : "bg-zinc-800 rounded-tl-none"
                  )}
                >
                  <p className="text-sm leading-snug">{msg.message}</p>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 py-4 mt-auto">
        <form
          onSubmit={handleSendMessage}
          className="relative group bg-gray-100 border border-zinc-700/50 rounded-full flex items-center px-4 py-1"
        >
          <input
            type="text"
            placeholder="Send a message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-transparent border-none py-2.5 text-black text-sm focus:outline-none placeholder:text-zinc-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={cn(
              "p-2 rounded-full transition-colors",
              inputValue.trim()
                ? "text-blue-400 hover:bg-zinc-800"
                : "text-zinc-600"
            )}
          >
            <SendHorizontal size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatDemo;
