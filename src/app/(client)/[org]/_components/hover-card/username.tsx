"use client";

import * as Popover from "@radix-ui/react-popover";
import { Clock } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useRef, useState } from "react";
import images from "~/assets/images";
import { PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { ChatBubbleIcon } from "~/svgs";
import { PostRequest } from "~/utils/new-request";

export default function UsernameHover({ item }: any) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<any>(null);
  const closeTimer = useRef<any>(null);
  const { state, dispatch } = useContext(DataContext);
  const { user, orgSlug } = state;
  const router = useRouter();

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);

    openTimer.current = setTimeout(() => {
      setOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (openTimer.current) clearTimeout(openTimer.current);

    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  const handleMessage = async () => {
    localStorage.setItem("channelName", item?.username);
    const orgId = localStorage.getItem("orgId") || "";

    // create a conversation
    const firstPayload = {
      chat_type: "user",
      participant_id: item?.user_id,
    };

    const res = await PostRequest(`/organisations/${orgId}/dms`, firstPayload);

    if (res?.status === 200 || res?.status === 201) {
      router.push(
        `/${orgSlug}/home/people/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}/dm`
      );
    }
  };

  const handleOpen = () => {
    dispatch({ type: ACTIONS.USER_DATA, payload: item });
    dispatch({ type: ACTIONS.HOVER_PROFILE, payload: true });
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleOpen}
          className="ml-1 py-[1px] px-[3px] bg-[#F1F1FE] text-[#7141F8] dark:bg-[#2D2463] dark:text-[#C4B5FD] text-[15px] rounded-[3px] cursor-pointer"
        >
          {" "}
          @{item?.username}
        </span>
      </PopoverTrigger>

      <PopoverContent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sideOffset={8}
        side="top"
        className="z-50 w-auto rounded-md border border-gray-200 bg-white shadow-lg p-4"
        align="start"
      >
        <div className="flex items-center gap-4">
          <Image
            src={item?.avatar_url ? item?.avatar_url : item?.default_avatar_url}
            alt="avatar"
            width={80}
            height={80}
            className="rounded-[7px] border size-20 object-cover"
          />
          <div>
            <p className="font-semibold text-[15px] text-black">
              {item?.username || item?.full_name?.trim()}{" "}
              {item?.user_id === user?.user_id && (
                <span className="text-gray-500">(you)</span>
              )}
            </p>
            {item?.user_id === user?.user_id ? (
              <p className="text-sm text-gray-500 mt-0.5">{user?.title}</p>
            ) : (
              <p className="text-sm text-gray-500 mt-0.5">{item?.email}</p>
            )}
          </div>
        </div>

        <div className="flex items-center text-[15px] text-gray-600 mt-4">
          <Clock className="w-4 h-4 mr-2" />
          {moment(item?.created_at).format("LT")} local time
        </div>

        {item?.user_id === user?.user_id ? (
          <button
            onClick={() => dispatch({ type: ACTIONS.STATUS, payload: true })}
            className="mt-3 w-full border text-sm font-medium border-gray-300 rounded-md py-1.5 hover:bg-gray-50 transition"
          >
            Set a status
          </button>
        ) : (
          <button
            onClick={handleMessage}
            className="flex items-center justify-center gap-1 mt-3 w-full border text-sm font-medium border-gray-300 rounded-md py-1.5 hover:bg-gray-50 transition"
          >
            <ChatBubbleIcon />
            Message
          </button>
        )}
      </PopoverContent>
    </Popover.Root>
  );
}
