"use client";
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import Image from "next/image";
import { X } from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import images from "~/assets/images";

export interface User {
  id: string;
  name: string;
  username: string;
  profile_url: string;
  avatar_url: string;
  default_avatar_url: string;
}

const NewChatHeader = ({ onUsersSelected }: any) => {
  const { state } = useContext(DataContext);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(
    state?.orgMembers || []
  );
  const [isInputFocused, setIsInputFocused] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchLower = inputValue.toLowerCase();
    const filtered =
      state?.orgMembers?.filter(
        (user: User) =>
          !selectedUsers?.find((selected) => selected.id === user?.id) &&
          user?.name.toLowerCase().includes(searchLower)
      ) || [];
    setFilteredUsers(filtered);
  }, [selectedUsers, inputValue, state?.orgMembers]);

  useEffect(() => {
    onUsersSelected(selectedUsers);
  }, [selectedUsers, onUsersSelected]);

  const handleSearch = (search: string) => {
    setInputValue(search);
    if (!open) setOpen(true);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUsers((prev) => [...prev, user]);
    setInputValue("");
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user?.id !== userId));
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  //

  return (
    <div className="p-5 border-b border-[#E6EAEF] shadow-[0px_3px_6px_0px_#DFDFDF]">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg text-[#1D2939] font-black">New Group Chat</h2>
        {/* <span className="text-[#98A2B3] text-[13px]">Saved 1 minute ago</span> */}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[#344054]">With:</span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              ref={triggerRef}
              className="flex-1 flex flex-wrap gap-2 items-center min-h-[40px] rounded-md px-2 cursor-text"
              onClick={() => {
                inputRef.current?.focus();
                setIsInputFocused(true);
                setOpen(true);
              }}
            >
              {isInputFocused ? (
                selectedUsers?.map((user) => (
                  <div
                    key={user?.id}
                    className="flex items-center gap-1 bg-[#F1F1FE] rounded-[3px] overflow-hidden"
                  >
                    <Image
                      src={
                        user?.avatar_url ||
                        user?.default_avatar_url ||
                        images?.user
                      }
                      alt={user?.name}
                      width={24}
                      height={24}
                      className="size-6 rounded-sm border object-cover"
                    />
                    <span className="text-sm font-semibold text-[#101828]">
                      {user?.name}
                    </span>
                    <button
                      type="button"
                      // onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUser(user?.id);
                      }}
                      className="hover:bg-gray-200 rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-[15px] text-[#344054] font-bold">
                  {selectedUsers.map((user) => user?.name).join(", ")}
                </span>
              )}
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => handleSearch(e.target.value)}
                onClick={handleInputClick}
                onFocus={() => {
                  setIsInputFocused(true);
                  // setOpen(true);
                }}
                onBlur={(e) => {
                  if (
                    popoverContentRef.current &&
                    !popoverContentRef.current.contains(e.relatedTarget)
                  ) {
                    setIsInputFocused(false);
                  }
                }}
                placeholder={
                  selectedUsers.length === 0
                    ? "#a-channel, @somebody, or somebody"
                    : ""
                }
                className="flex-1 outline-none text-[15px] placeholder:text-[#98A2B3] min-w-[200px]"
              />
            </div>
          </PopoverTrigger>

          <PopoverContent
            ref={popoverContentRef}
            className="p-0"
            align="start"
            sideOffset={5}
            style={{ width: triggerRef.current?.offsetWidth || "auto" }}
            onInteractOutside={(e) => {
              if (inputRef.current?.contains(e.target as Node)) {
                e.preventDefault();
              }
            }}
          >
            <div className="py-2 w-full max-h-[400px] overflow-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user?.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center gap-[10px] px-4 py-[10px] hover:bg-[#F1F1FE] cursor-pointer"
                  >
                    <Image
                      src={
                        user?.avatar_url ||
                        user?.default_avatar_url ||
                        images?.user
                      }
                      alt={user?.name}
                      width={20}
                      height={20}
                      className="rounded-[5px] size-6 object-cover border"
                    />
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[#101828] text-sm font-semibold">
                        {user?.name}
                      </span>
                      {user?.username && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-[#E4E7EC]" />
                          <span className="text-[14px] text-[#344054]">
                            {user?.username}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-[#667085]">No users found</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default NewChatHeader;
