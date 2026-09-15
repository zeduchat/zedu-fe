"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCircleMore,
  SmilePlus,
  Bookmark,
  BookmarkCheck,
  Webhook,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  User,
  Link2,
  Hash,
  Sparkles,
} from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { useParams, usePathname } from "next/navigation";
import ReplyCard from "../reply-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import EmojiPicker from "~/components/theme/themed-emoji-picker";
import data from "@emoji-mart/data";
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

type ParsedField = {
  label: string | null;
  value: string;
};

const parseWebhookFields = (message: string): ParsedField[] => {
  return String(message || "")
    .split("\\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?):\s*(.*)$/);
      if (match) {
        return { label: match[1].trim(), value: match[2].trim() };
      }
      return { label: null, value: line };
    });
};

const fieldIcon = (label: string | null) => {
  const key = (label || "").toLowerCase();
  if (key.includes("email")) return Mail;
  if (key.includes("name")) return User;
  if (key.includes("url") || key.includes("link")) return Link2;
  if (key.includes("id")) return Hash;
  return Sparkles;
};

const formatCardTime = (dateValue?: string) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const Thread = ({
  item,
  compact = false,
}: {
  item: any;
  compact?: boolean;
}) => {
  const { state, dispatch } = useContext(DataContext);
  const { bookmarks, user } = state;
  const pathname = usePathname();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const params = useParams();
  const id = params.id as string;
  const isSaved = bookmarks?.some((b: any) => b.thread_id === item.thread_id);
  const [usernames, setUsernames] = useState<any>([]);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSuccess = item?.status === "success";
  const fields = useMemo(
    () => parseWebhookFields(item?.message),
    [item?.message]
  );
  const sourceName = item?.username || item?.webhook_name || "Incoming webhook";
  const eventTitle = item?.event_name || "Webhook event";

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
    const payload = {
      thread_id: item?.thread_id,
      type: "thread",
      reaction: emojiData.native,
    };
    await PostRequest(`/reactions/${id}`, payload);
    setIsEmojiPickerOpen(false);
    setEmojiPickerOpen(false);
  };

  const handleUpdateEmoji = async (emoji: any) => {
    const payload = {
      thread_id: item?.thread_id,
      type: "thread",
      reaction: emoji,
    };
    await PostRequest(`/reactions/${id}`, payload);
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

  const reactionUsers = async (reactionId: string) => {
    const res = await GetRequest(
      `/reactions/${reactionId}/thread/${item?.thread_id}`
    );
    if (res?.status === 200 || res?.status === 201) {
      const names = (res?.data?.data?.usernames || [])
        .map((name: any) =>
          typeof name === "string"
            ? name.trim()
            : (
                name?.username ||
                name?.user_name ||
                name?.display_name ||
                ""
              ).trim()
        )
        .filter(Boolean);

      const currentUserName = (
        user?.username ||
        user?.display_name ||
        user?.full_name ||
        ""
      ).trim();

      if (names.length === 0 && currentUserName) {
        setUsernames([currentUserName]);
      } else {
        setUsernames(names);
      }
    }
  };

  const handleClick = (emoji: any, e: any) => {
    handleUpdateEmoji(emoji.reaction);
    e.stopPropagation();
  };

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
      onClick={handleMessageClick}
      className={cn(
        "@container relative group overflow-hidden rounded-2xl border bg-white transition-all duration-300",
        "shadow-[0_10px_40px_-18px_rgba(16,24,40,0.18)] hover:shadow-[0_18px_50px_-20px_rgba(87,87,205,0.28)]",
        compact ? "mx-0 my-0" : "mx-3 my-4 sm:mx-5",
        isSuccess
          ? "border-emerald-200/70 hover:border-emerald-300"
          : "border-rose-200/80 hover:border-rose-300"
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-[5px]",
          isSuccess
            ? "bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-600"
            : "bg-gradient-to-b from-rose-400 via-orange-400 to-rose-600"
        )}
      />

      <div
        className={cn(
          "relative flex flex-col gap-3 border-b bg-white px-3 py-3 pl-4",
          "@sm:flex-row @sm:items-start @sm:px-4 @sm:py-3.5 @sm:pl-5",
          isSuccess ? "border-emerald-100" : "border-rose-100"
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="relative shrink-0">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5757CD] to-[#8B7CFF] text-white shadow-lg shadow-indigo-200/70 @sm:size-11">
              <Webhook className="size-5" />
            </div>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white",
                isSuccess ? "bg-emerald-500" : "bg-rose-500"
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words text-[15px] font-bold tracking-tight text-[#101828]">
                {sourceName}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E4E7EC] bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                Webhook
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#667085]">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5 text-[#98A2B3]" />
                {formatCardTime(item?.created_at)}
              </span>
              {item?.action_type ? (
                <span className="capitalize text-[#98A2B3]">
                  {item.action_type.replaceAll("_", " ")}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            isSuccess
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          )}
        >
          {isSuccess ? (
            <CheckCircle2 className="size-3.5" />
          ) : (
            <XCircle className="size-3.5" />
          )}
          {isSuccess ? "Delivered" : "Failed"}
        </span>
      </div>

      <div
        className={cn(
          "relative px-3 pb-3 pl-4",
          compact ? "pt-3" : "pt-3 @sm:px-4 @sm:pl-5 @sm:pt-4"
        )}
      >
        <h3 className="break-words text-[16px] font-semibold leading-snug text-[#101828]">
          {eventTitle}
        </h3>

        {fields.length > 0 && (
          <div
            className={cn(
              "mt-3 grid grid-cols-1 gap-2",
              !compact && fields.length > 1 && "@lg:grid-cols-2"
            )}
          >
            {fields.map((field, index) => {
              const Icon = fieldIcon(field.label);
              const isEmail = /@/.test(field.value);

              return (
                <div
                  key={`${field.label}-${index}`}
                  className="min-w-0 rounded-xl border border-[#EEF0F4] bg-[#FBFBFD] px-3 py-2.5"
                >
                  {field.label ? (
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                      <Icon className="size-3" />
                      {field.label}
                    </div>
                  ) : null}
                  <p
                    className={cn(
                      "break-words text-[13px] leading-5 text-[#344054]",
                      isEmail && "font-medium text-[#5757CD]"
                    )}
                  >
                    {field.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!compact && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {item?.reactions?.map((emoji: any, index: number) => {
              const displayNames = (usernames || []).filter(Boolean);

              let namesListString = "";
              if (displayNames.length === 1) {
                namesListString = displayNames[0];
              } else if (displayNames.length > 1) {
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
                        className="flex h-[28px] cursor-pointer items-center justify-center rounded-full border border-indigo-200 bg-[#F4F3FF] px-3 py-1 text-[13px] text-[#5757CD]"
                      >
                        {emoji?.reaction} {emoji?.reaction_count}
                      </div>
                    </TooltipTrigger>

                    <TooltipContent className="rounded-md bg-black p-2 text-sm text-white">
                      <TooltipArrow className="fill-black" />

                      <div className="mx-auto mb-2 flex w-[70px] items-center justify-center rounded-lg bg-white p-2 text-center text-5xl">
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
                          className="flex h-[28px] cursor-pointer items-center justify-center rounded-full border border-[#E4E7EC] bg-white px-3 py-1 text-[#667085] hover:border-[#5757CD]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SmilePlus size={16} />
                        </div>
                      )}
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-md bg-black p-2 text-sm text-white">
                    <TooltipArrow className="fill-black" />
                    <span>Add reaction...</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent className="z-50 w-full max-w-xs p-0" align="end">
                <EmojiPicker data={data} onEmojiSelect={onEmojiClick} />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {!compact && item?.message_count > 0 && (
          <ReplyCard
            users={item?.messages}
            totalReplies={item?.message_count}
            lastReplyTime={item.last_reply || item?.created_at}
            handleReply={handleReply}
          />
        )}
      </div>

      <div
        className={cn(
          "absolute right-2 top-2 z-10 flex items-center rounded-[10px] border border-[#E6EAEF] bg-white/95 p-[2px] shadow-md backdrop-blur transition-all duration-200 @sm:right-3 @sm:top-3",
          "lg:flex lg:opacity-0 lg:group-hover:opacity-100",
          showMobileActions
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0 lg:pointer-events-auto lg:scale-100 lg:opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {!compact && !pathname?.includes("/agents") && (
          <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <button className="rounded-lg px-[10px] py-[7px] hover:bg-[#F2F4F7]">
                <SmilePlus size={18} className="text-[#667085]" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="z-50 w-full max-w-xs p-0" align="end">
              <EmojiPicker data={data} onEmojiSelect={onEmojiClick} />
            </PopoverContent>
          </Popover>
        )}

        {!compact && !pathname?.includes("/agents") && (
          <button
            className="rounded-lg px-[10px] py-[7px] hover:bg-[#F2F4F7]"
            onClick={handleReply}
          >
            <MessageCircleMore size={18} className="text-[#667085]" />
          </button>
        )}

        <button
          onClick={isSaved ? toggleRemove : toggleSave}
          className="rounded-lg px-[10px] py-[7px] hover:bg-[#F2F4F7]"
        >
          {isSaved ? (
            <BookmarkCheck size={18} className="text-primary-500" />
          ) : (
            <Bookmark size={18} className="text-[#667085]" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Thread;
