"use client";

import { cn } from "~/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { PostRequest } from "~/utils/new-request";
import FallbackImage from "~/components/layout/fallback-image";
import { useContext } from "react";
import { DataContext } from "~/store/GlobalState";

export const AgentRecentCard = (props: any) => {
  const params = useParams();
  const id2 = params.id2 as string;
  const router = useRouter();
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  const handleRoute = async () => {
    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      chat_type: "bot",
      participant_id: props?.id,
    };

    if (props?.id) {
      localStorage.setItem("channelName", props?.name);
    }

    const res = await PostRequest(`/organisations/${orgId}/dms`, payload);

    if (res?.status === 200 || res?.status === 201) {
      router.push(
        `/${orgSlug}/colleagues/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}`
      );
    }
  };

  // Determine if this card is the currently selected one
  const isSelected = props.id === id2;

  //

  return (
    <li
      className={cn(
        "relative px-3 py-2 mx-2 flex items-center rounded-lg group hover:bg-blue-200 hover:text-white cursor-pointer",
        isSelected ? "bg-blue-200 text-white" : ""
      )}
      onClick={handleRoute}
    >
      <div className="flex-1 flex items-center gap-2">
        <div className="flex items-center justify-center size-3 h-5 w-5 rounded bg-gray-100 border ">
          <FallbackImage
            src={props.avatar}
            alt="colleague"
            userType="bot"
            className="w-5 h-5 object-cover"
          />
        </div>

        <p
          className={cn(
            "text-[15px] text-blue-50 leading-4 capitalize truncate w-[200px]"
          )}
          title={props.name}
        >
          {props?.name}
        </p>
      </div>
    </li>
  );
};
