"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { PostRequest } from "~/utils/new-request";
import { Clock, Hash } from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import { openSearchMessageResult } from "~/lib/search/navigate";
import type { MessageSearchResult, UserSearchResult } from "~/lib/search/types";
import { formatSearchTimestamp, stripHtmlAndDecode } from "~/lib/search/format";

type CardItem = MessageSearchResult | UserSearchResult;

interface CardProps {
  cardData: CardItem[];
}

function isMessageCard(item: CardItem): item is MessageSearchResult {
  return (item as MessageSearchResult).messages !== undefined;
}

export const SearchCards = ({ cardData }: CardProps) => {
  const router = useRouter();
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug } = state;
  const orgId =
    typeof window !== "undefined" ? localStorage.getItem("orgId") || "" : "";

  if (!cardData || cardData.length === 0) {
    return null;
  }

  const handleUserCardClick = async (user: UserSearchResult) => {
    if (!orgId || !orgSlug) return;
    localStorage.setItem("channelName", user.username);
    const res = await PostRequest(`/organisations/${orgId}/dms`, {
      chat_type: "user",
      participant_id: user.id,
    });

    if (res?.status === 200 || res?.status === 201) {
      router.push(
        `/${orgSlug}/home/people/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}/dm`
      );
    }
  };

  const handleMessageCardClick = (item: MessageSearchResult) => {
    openSearchMessageResult({
      result: item,
      orgSlug,
      router,
      dispatch,
    });
  };

  return (
    <div className="w-full space-y-3">
      {cardData.map((item, idx) => {
        const isMessage = isMessageCard(item);

        const key = isMessage
          ? item.messages[0]?.message_id || `msg-${idx}`
          : item.id;

        const avatar = isMessage
          ? item.user.avatar_url
          : item.profile_url || item.avatar_url;
        const name = isMessage ? item.user.user_name : item.name;
        const initials = name?.charAt(0).toUpperCase() || "U";

        return (
          <div
            key={key}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
            onClick={async () => {
              if (isMessage) {
                handleMessageCardClick(item);
              } else {
                await handleUserCardClick(item);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {isMessage ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900">
                        {item.user.user_name}
                      </h3>
                      {item.messages[0]?.timestamp && (
                        <span className="ml-auto text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                          <Clock size={12} />
                          {formatSearchTimestamp(item.messages[0].timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 break-words mb-2">
                      {stripHtmlAndDecode(item.messages[0]?.message || "")}
                    </p>
                    <span className="inline-flex items-center gap-1 bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-600">
                      <Hash size={12} />
                      {item.channel.channel_name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900">
                        {item.name}
                      </h3>
                      {item.username && (
                        <span className="text-xs text-gray-500">
                          @{item.username}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      {item.email && (
                        <span className="text-sm text-gray-600 truncate">
                          {item.email}
                        </span>
                      )}
                      {item.role && (
                        <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 capitalize">
                          {item.role}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
