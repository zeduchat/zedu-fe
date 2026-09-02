"use client";

import { cn } from "~/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { formatCount } from "~/utils/utils";
import UserAvatar from "~/components/layout/user-avatar";
import { useContext, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { DeleteRequest, PatchRequest, PostRequest } from "~/utils/new-request";
import { X } from "lucide-react";
import Loading from "~/components/ui/loading";
import { showSuccess } from "~/components/toast/sonner";

interface ComponentProps {
  username: string;
  participant_id?: string;
  channel_id?: string;
  avatar_url: string;
  default_avatar_url: string;
  channel_type: string;
  thread_count: number;
  preview_thread: any;
  participants?: any[];
  online?: boolean;
  is_suggested?: boolean;
}

export const PeopleHomeCard = (props: ComponentProps) => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug, orgId: stateOrgId, groupCallback, homeDms } = state;
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRoute = async () => {
    localStorage.setItem("channelName", props?.username);

    dispatch({
      type: ACTIONS.CHATS,
      payload: { newThreads: props.preview_thread || [], newPage: 1 },
    });

    if (props?.channel_type === "dm") {
      const participant = props?.participants?.[0];
      dispatch({ type: ACTIONS.PARTICIPANT, payload: participant });

      router.push(
        `/${orgSlug}/home/people/${props?.channel_id}/${props?.participant_id}/dm`
      );
    } else {
      dispatch({ type: ACTIONS.PARTICIPANTS, payload: props?.participants });
      router.push(`/${orgSlug}/home/people/${props?.channel_id}/dms`);
    }
  };

  const handleSuggestedRoute = async () => {
    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      chat_type: "user",
      participant_id: props?.participant_id,
    };

    const res = await PostRequest(`/organisations/${orgId}/dms`, payload);

    if (res?.status === 200 || res?.status === 201) {
      router.push(
        `/${orgSlug}/home/people/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}/dm`
      );
    }
  };

  const isSelected = props.channel_id === id;
  const isActive = props?.thread_count > 0;

  const isOnline =
    props?.participants?.length === 1
      ? props?.participants?.[0]?.online
      : props?.participants?.some((participant) => participant.online);

  const handleRemove = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (props.is_suggested || !props.channel_id) return;

    const orgId =
      stateOrgId ||
      (typeof window !== "undefined"
        ? localStorage.getItem("orgId") || ""
        : "");

    if (!orgId) return;

    setIsRemoving(true);

    try {
      const res = await PatchRequest(`/dms/${props.channel_id}/visibility`, {
        visibility_status: false,
      });

      if (res?.status === 200 || res?.status === 201) {
        dispatch({
          type: ACTIONS.HOME_DMS,
          payload: (homeDms || []).filter(
            (dm: { channel_id?: string }) =>
              String(dm.channel_id) !== String(props.channel_id)
          ),
        });

        if (isSelected) {
          dispatch({ type: ACTIONS.CLEAR_CHATS });
          router.push(`/${orgSlug}/home/people`);
        }
      }
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <li
      className={cn(
        "relative px-2 py-2 mx-2 flex items-center rounded-lg group hover:bg-blue-200 hover:text-white cursor-pointer",
        isSelected ? "bg-blue-200 text-white" : ""
      )}
      onClick={props?.is_suggested ? handleSuggestedRoute : handleRoute}
    >
      <div className="flex-1 flex items-center gap-3">
        {props?.channel_type === "dm" ? (
          <div className="relative flex items-center justify-center size-2 h-5 w-5 rounded bg-blue-100">
            <UserAvatar
              src={props.avatar_url}
              defaultAvatarUrl={props.default_avatar_url}
              userType="user"
              size="tiny"
              alt="dms"
              imageClassName="rounded"
            />

            {isOnline && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 h-[8px] w-[8px] border border-white rounded-full" />
            )}
          </div>
        ) : (
          <div className="relative flex items-center h-5 w-5 rounded">
            <UserAvatar
              src={props.avatar_url}
              defaultAvatarUrl={props.default_avatar_url}
              alt="dms"
              userType="user"
              size="tiny"
              imageClassName="rounded"
            />

            <div
              className={cn(
                "text-[10px] absolute -bottom-1 -right-2 h-[15px] w-[15px] rounded text-white flex items-center justify-center",
                "bg-blue-200"
              )}
            >
              {props?.username?.split(", ").length}
            </div>
          </div>
        )}

        <p
          className={cn(
            "text-[15px] leading-4 capitalize truncate w-[180px]",
            isActive ? "font-semibold text-white" : "text-blue-50"
          )}
          title={props.username}
        >
          {props.username}
        </p>
      </div>

      {props.thread_count > 0 && (
        <div
          className={cn(
            `absolute right-3 flex items-center justify-center rounded-full bg-blue-200 text-white tracking-[-0.5%] font-bold text-right text-[10px] px-2 transition-opacity group-hover:opacity-0`,
            isSelected ? "bg-blue-500 text-white" : ""
          )}
        >
          {formatCount(props?.thread_count || 0)}
        </div>
      )}

      {!props.is_suggested && (
        <button
          type="button"
          aria-label="Remove conversation"
          onClick={handleRemove}
          className={cn(
            "absolute right-3 flex items-center justify-center rounded-full size-5 bg-blue-200 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-500",
            isSelected ? "bg-blue-500" : ""
          )}
        >
          {isRemoving ? (
            <Loading color="white" height="12px" width="12px" />
          ) : (
            <X size={12} strokeWidth={2.5} />
          )}
        </button>
      )}
    </li>
  );
};
