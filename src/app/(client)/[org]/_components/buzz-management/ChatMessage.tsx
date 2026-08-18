import React from "react";
import { format } from "date-fns";

interface ChatMessageProps {
  sender: string;
  message: string;
  timestamp: number; // Changed to number
  isCurrentUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  message,
  timestamp,
  isCurrentUser,
}) => {
  const formattedTimestamp =
    typeof timestamp === "number" && !isNaN(timestamp)
      ? format(new Date(timestamp), "p")
      : "Invalid Time";

  return (
    <div
      className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex flex-col rounded-lg px-3 py-2 max-w-xs ${
          isCurrentUser
            ? "bg-[#4b4baf] text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        <div className="font-semibold">{sender}</div>
        <div className="mb-1">{message}</div>
        <div className="text-xs text-right">{formattedTimestamp}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
