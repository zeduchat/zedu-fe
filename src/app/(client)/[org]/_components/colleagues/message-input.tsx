"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface Props {
  agent: any;
}

export default function MessageInput({ agent }: Props) {
  const [message, setMessage] = useState("");

  return (
    <div
      className="
        flex w-full border border-gray-300 py-3 rounded-md overflow-hidden bg-white shadow-sm
        hover:border-[#A5B4FC] focus-within:border-[#A5B4FC]
        transition-colors duration-150
      "
    >
      {/* Textarea Field */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={1}
        placeholder={`What would you like ${agent?.name} to be able to do? Start typing...`}
        className="flex-1 resize-none px-4 py-2 text-sm text-gray-800 outline-none border-none focus:ring-0 leading-tight"
      />

      {/* Divider */}
      <div className="w-[1px] bg-gray-200"></div>

      {/* Send Button */}
      <button
        className="flex items-center gap-1 bg-[#5B5FF7] hover:bg-[#4a4dd9] 
                   text-white text-sm font-medium px-4 py-1.5 rounded-md mx-3"
      >
        Send
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
