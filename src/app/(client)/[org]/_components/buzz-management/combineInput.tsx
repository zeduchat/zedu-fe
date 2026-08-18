/* eslint-disable no-unused-vars */
"use client";

import React, { useRef } from "react";

import { User } from "./buzz-userItems";
import { X } from "lucide-react";

interface Props {
  selected: User[];
  onKeyDown: (e: React.KeyboardEvent) => void;
  onRemove: (u: User) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export default function CombinedInviteInput({
  selected,
  onKeyDown,
  onRemove,
  search,
  onSearchChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="w-full min-h-[40px] flex items-center flex-wrap gap-2 p-3 border-2 border-[#c8c4ff] rounded-xl focus-within:border-[#5F5FE1]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Selected Tags */}
      {selected.map((user) => (
        <div
          key={user.id}
          className="px-3 py-1 bg-[#f0edff] text-[#4d47c3] rounded-md flex items-center gap-2"
        >
          <span className="text-sm">
            {user.name || user.username || user.email}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(user);
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Text Input */}
      <input
        ref={inputRef}
        value={search}
        onKeyDown={onKeyDown}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={selected.length === 0 ? "Search by name" : ""}
        className="flex-1 outline-none bg-transparent min-w-[120px]"
      />
    </div>
  );
}
