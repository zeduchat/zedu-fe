"use client";

import { cn } from "~/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { formatCount } from "~/utils/utils";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { useContext } from "react";
import { DataContext } from "~/store/GlobalState";

interface ComponentProps {
  name: string;
  active: boolean;
  thread_count: number;
  channels_id: string;
  id?: string;
  archived?: boolean;
  mention_count: number;
}

export const ChannelCardArchive = (props: ComponentProps) => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  // Determine if this card is the currently selected one
  const isSelected = props.channels_id === id;

  // select channel
  const selectChannel = () => {
    router.push(`/${orgSlug}/home/channels/${props.channels_id}`);
    localStorage.setItem("channelId", props?.channels_id);
    localStorage.setItem("channelName", props?.name);
  };

  //

  return (
    <li
      className={cn(
        "px-2 py-[7px] mx-2 flex gap-2 rounded-lg group hover:bg-blue-200 cursor-pointer",
        isSelected ? "bg-blue-200" : ""
      )}
      onClick={selectChannel}
    >
      <div className="flex-1 flex items-center gap-1">
        <LockClosedIcon
          className={cn("size-4", props.active ? "text-white" : "text-blue-50")}
        />
        <p
          className={cn(
            "text-[15px] leading-4 lowercase truncate w-[180px]",
            props.active ? "font-semibold text-white" : "text-blue-50"
          )}
          title={props.name}
        >
          {props.name}
        </p>
      </div>

      {props.mention_count > 0 && (
        <div
          className={cn(
            `absolute right-3 flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-500 text-white tracking-[-0.5%] font-bold text-right text-[10px] px-2`,
            isSelected ? "bg-blue-500 text-white" : ""
          )}
        >
          {formatCount(props?.mention_count || 0)}
        </div>
      )}
    </li>
  );
};
