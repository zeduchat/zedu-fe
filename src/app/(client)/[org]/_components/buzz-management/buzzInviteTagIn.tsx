/* eslint-disable no-unused-vars */
"use client";

import React, { useState } from "react";

import type { User } from "./buzz-userItems";
import { X } from "lucide-react";

interface TagInputProps {
  value: User[];
  onChange: (users: User[]) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const removeUser = (id: string) => {
    onChange(value.filter((u) => u.id !== id));
  };

  return (
    <div className="flex flex-wrap gap-2 items-center min-h-[64px] p-3 border border-[#8C85FF] rounded-xl">
      {value.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-2 bg-[#EFEAFF] px-3 py-1 rounded-md text-sm text-[#5A4BE7]"
        >
          {user.name || user.email || user.username}
          <X
            className="w-4 h-4 cursor-pointer"
            onClick={() => removeUser(user.id)}
          />
        </div>
      ))}

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add people..."
        className="flex-1 bg-transparent outline-none py-1 text-sm focus:bg-[#F5F2FF] rounded-md px-2"
      />
    </div>
  );
}
