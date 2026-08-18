"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Forward,
  MessageCircleMore,
  SmilePlus,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import MessageItem from "./message-item";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { useParams, usePathname } from "next/navigation";
import ReplyCard from "../reply-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import EmojiPicker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import More from "./more";
import UserHoverCard from "../hover-card/user";
import {
  DeleteSavedMessage,
  GetRequest,
  PostRequest,
  SaveMessage,
} from "~/utils/new-request";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { cn } from "~/lib/utils";
import UserAvatar from "~/components/layout/user-avatar";

interface MessageProps {
  item: any;
  shouldShowAvatar: any;
  popupId?: any;
  setPopupId?: any;
}

const Message = ({
  item,
  shouldShowAvatar,
  setPopupId,
  popupId,
}: MessageProps) => {
  const { state, dispatch } = useContext(DataContext);
  const { bookmarks, user, orgMembers } = state;
  const pathname = usePathname();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const params = useParams();
  const id = params.id as string;
  const isSaved = bookmarks?.some((b: any) => b.thread_id === item.thread_id);
  const [usernames, setUsernames] = useState<any>([]);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // user data
  const isOnline = orgMembers?.find(
    (member: any) => member.id === item.user_id
  )?.online;

  const handleReply = () => {
    dispatch({
      type: ACTIONS.REPLIES,
      payload: { newThreads: item.preview_reply, newPage: 1 },
    });
    dispatch({ type: ACTIONS.THREAD, payload: item });
    dispatch({ type: ACTIONS.REPLY, payload: true });
    dispatch({ type: ACTIONS.LOAD_THREAD, payload: !state.loadThread });
  };

  const onEmojiClick = async (emojiData: any) => {
    setIsEmojiPickerOpen(false);

    const payload = {
      thread_id: item?.thread_id,
      // message_id: item?.id,
      type: "thread",
      reaction: emojiData.native,
    };
    await PostRequest(`/reactions/${id}`, payload);
    setIsEmojiPickerOpen(false);
    setEmojiPickerOpen(false);
  };

  const handleUpdateEmoji = async (emoji: any) => {
    setIsEmojiPickerOpen(false);

    const payload = {
      thread_id: item?.thread_id,
      type: "thread",
      reaction: emoji,
    };
    await PostRequest(`/reactions/${id}`, payload);
  };

  const handleOpen = () => {
    dispatch({ type: ACTIONS.USER_DATA, payload: item });
    dispatch({ type: ACTIONS.HOVER_PROFILE, payload: true });
  };

  const toggleSave = async () => {
    const updatedIds = [
      ...bookmarks,
      { id: item.id, thread_id: item.thread_id },
    ];

    dispatch({ type: ACTIONS.BOOKMARKS, payload: updatedIds });

    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      channels_id: item?.channels_id,
      thread_id: item.thread_id,
      type: "message",
    };

    await SaveMessage(`/organisations/${orgId}/thread/save`, payload);
  };

  const toggleRemove = async () => {
    const updatedIds = bookmarks.filter(
      (bookmark: any) => bookmark.thread_id !== item.thread_id
    );

    dispatch({ type: ACTIONS.BOOKMARKS, payload: updatedIds });

    const orgId = localStorage.getItem("orgId") || "";

    await DeleteSavedMessage(
      `/organisations/${orgId}/saved/message/${item.thread_id}`
    );
  };

  // get reactions users
  const reactionUsers = async (reactionId: string) => {
    const res = await GetRequest(
      `/reactions/${reactionId}/thread/${item?.thread_id}`
    );
    if (res?.status === 200 || res?.status === 201) {
      setUsernames(res?.data?.data?.usernames);
    }
  };

  const handleClick = (emoji: any, e: any) => {
    handleUpdateEmoji(emoji.reaction);
    e.stopPropagation();
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowMobileActions(false);
      }
    };

    if (showMobileActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileActions]);

  const handleMessageClick = () => {
    if (window.innerWidth < 1024) {
      setShowMobileActions(!showMobileActions);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative group py-1 transition-colors flex items-start px-5 gap-2`}
      onClick={handleMessageClick}
    >
      <div className="flex items-center justify-center">
        {shouldShowAvatar ? (
          <>
            <div className="relative inline-flex">
              <UserHoverCard
                item={item}
                handleOpen={handleOpen}
                isOnline={isOnline}
              />
            </div>
            <div
              className="relative flex lg:hidden cursor-pointer mb-2"
              onClick={handleOpen}
            >
              <UserAvatar item={item} size="sm" alt="profile" />
            </div>
          </>
        ) : (
          <span className="block text-xs w-[36px] text-[#98A2B3] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(item?.created_at)
              .toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
              .replace(/\s?(am|pm)/i, "")}
          </span>
        )}
      </div>

      <div className="w-full">
        {shouldShowAvatar && (
          <div className="flex items-center gap-2">
            <span
              className="hover font-bold text-[15px] text-[#1D2939] cursor-pointer"
              onClick={handleOpen}
            >
              {item?.username || item?.email}
            </span>

            <span className="text-xs text-[#98A2B3] mt-[1px]">
              {new Date(item?.created_at)
                .toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
                .replace(/\s?(am|pm)/i, "")}
            </span>
          </div>
        )}

        <div className="relative flex items-start justify-between">
          <div className="flex items-start gap-2">
            <MessageItem item={item} />

            <div className="text-[9px] text-neutral-500 mt-[2px]">
              {(item.user_type === "user" || item.user_type === "") &&
              item?.edited === true
                ? "(edited)"
                : ""}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-md mt-1">
          {item?.reactions?.map((emoji: any, index: number) => {
            const reactedUsernames = usernames || [];
            const currentUserUsername = user?.username;

            const displayNames = reactedUsernames.map((name: string) =>
              name === currentUserUsername ? "you" : name
            );

            let namesListString = "";
            if (displayNames.length === 0) {
              namesListString = " ";
            } else if (displayNames.length === 1) {
              namesListString = displayNames[0];
            } else {
              const last = displayNames[displayNames.length - 1];
              const rest = displayNames.slice(0, -1).join(", ");
              namesListString = `${rest} and ${last}`;
            }

            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onMouseEnter={() => reactionUsers(emoji.reaction_id)}
                      onClick={(e) => handleClick(emoji, e)}
                      className="bg-primary-50 text-[13px] cursor-pointer text-blue-100 border border-blue-400 flex items-center justify-center h-[27px] py-1 px-3 rounded-2xl"
                    >
                      {emoji?.reaction} {emoji?.reaction_count}
                    </div>
                  </TooltipTrigger>

                  <TooltipContent className="bg-black text-white p-2 rounded-md text-sm">
                    <TooltipArrow className="fill-black" />

                    <div className="text-5xl mx-auto text-center bg-white rounded-lg flex items-center justify-center p-2 w-[70px] mb-2">
                      {emoji.reaction}
                    </div>
                    {namesListString && (
                      <span>
                        {namesListString} reacted with {emoji?.reaction}
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}

          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    {item?.reactions?.length > 0 && (
                      <div
                        className="bg-primary-50 text-[13px] cursor-pointer text-blue-100 h-[27px] flex items-center justify-center py-1 px-3 rounded-full border hover:border-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SmilePlus size={16} />
                      </div>
                    )}
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white p-2 rounded-md text-sm">
                  <TooltipArrow className="fill-black" />
                  <span>Add reaction...</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent className="p-0 w-full max-w-xs z-50" align="end">
              <EmojiPicker data={data} onEmojiSelect={onEmojiClick} />
            </PopoverContent>
          </Popover>
        </div>

        {item?.message_count > 0 && (
          <ReplyCard
            users={item?.messages}
            totalReplies={item?.message_count}
            lastReplyTime={item.last_reply || item?.created_at}
            handleReply={handleReply}
          />
        )}

        {item?.type !== "system" && (
          <div
            className={cn(
              "flex items-center absolute right-5 -top-2 z-0 bg-white shadow-md rounded-[8px] border border-[#E6EAEF] p-[2px] transition-all duration-200",
              "lg:opacity-0 lg:group-hover:opacity-100 lg:flex",
              showMobileActions
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none lg:pointer-events-auto lg:scale-100 lg:opacity-0"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {!pathname?.includes("/agents") && (
              <Popover
                open={isEmojiPickerOpen}
                onOpenChange={setIsEmojiPickerOpen}
              >
                <PopoverTrigger asChild>
                  <button className="py-[7px] px-[10px] hover:bg-gray-200 rounded">
                    <SmilePlus size={18} className="text-[#667085]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-full max-w-xs z-50"
                  align="end"
                >
                  <EmojiPicker data={data} onEmojiSelect={onEmojiClick} />
                </PopoverContent>
              </Popover>
            )}

            {!pathname?.includes("/agents") && (
              <button
                className="py-[7px] px-[10px] hover:bg-gray-200 rounded"
                onClick={handleReply}
              >
                <MessageCircleMore size={18} className="text-[#667085]" />
              </button>
            )}

            <button className="py-[7px] px-[10px] hover:bg-gray-200 rounded">
              <Forward size={18} className="text-[#667085]" />
            </button>

            <button
              onClick={isSaved ? toggleRemove : toggleSave}
              className="py-[7px] px-[10px] hover:bg-gray-200 rounded"
            >
              {isSaved ? (
                <BookmarkCheck size={18} className="text-primary-500" />
              ) : (
                <Bookmark size={18} className="text-[#667085]" />
              )}
            </button>

            <More item={item} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
