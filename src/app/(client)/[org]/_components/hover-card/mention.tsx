import { MessageSquare, Headset } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import images from "~/assets/images";
import { Button } from "~/components/ui/button";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { User } from "~/types/index.";
import { GetRequest, PostRequest } from "~/utils/new-request";

const isSameUserId = (a?: string | number | null, b?: string | number | null) =>
  a != null && b != null && String(a) === String(b);

const isMentionedCurrentUser = (
  mentionUserId: string,
  profile: User | null,
  currentUser?: Record<string, unknown> | null
) => {
  if (!currentUser) return false;

  const currentIds = [
    currentUser.user_id,
    currentUser.id,
    currentUser.userid,
  ].filter((value) => value != null && value !== "");

  const mentionIds = [mentionUserId, profile?.id, profile?.userid].filter(
    (value) => value != null && value !== ""
  );

  for (const mentionId of mentionIds) {
    for (const currentId of currentIds) {
      if (isSameUserId(mentionId, currentId as string)) return true;
    }
  }

  return false;
};

export default function UserHoverCardContent({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { state, dispatch } = useContext(DataContext);
  const { orgSlug, user: loggedInUser } = state;
  const router = useRouter();

  const isSelf = useMemo(
    () => isMentionedCurrentUser(userId, user, loggedInUser),
    [userId, user, loggedInUser]
  );

  useEffect(() => {
    if (userId) {
      const fetchChannelById = async () => {
        const res = await GetRequest(`/users/mentions/${userId}`);
        if (res?.status === 200 || res?.status === 201) {
          setUser(res.data.data);
        }
        setLoading(false);
      };
      fetchChannelById();
    }
  }, [userId]);

  const handleRoute = async () => {
    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      chat_type: "user",
      participant_id: user?.userid,
    };

    const res = await PostRequest(`/organisations/${orgId}/dms`, payload);

    if (res?.status === 200 || res?.status === 201) {
      router.push(
        `/${orgSlug}/people/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}`
      );
    }
  };

  const handleSetStatus = () => {
    dispatch({ type: ACTIONS.STATUS, payload: true });
  };

  //

  if (loading) {
    return (
      <div className="max-w-[300px] w-full bg-white animate-pulse">
        <div className="p-4 flex gap-4">
          <div className="size-16 rounded-xl bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2 overflow-hidden">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[300px] w-full bg-white">
      <div className="p-4 flex gap-4">
        <div className="size-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
          <Image
            src={user?.avatar_url || user?.default_avatar_url || images.user}
            className="object-cover w-full h-full"
            alt="User"
            width={64}
            height={64}
          />
        </div>

        <div className="overflow-hidden">
          <h3 className="font-bold text-[17px] flex items-center gap-1.5 truncate">
            {user?.username}
            {isSelf && (
              <span className="text-sm font-normal text-gray-500">(you)</span>
            )}
          </h3>
          <p className="text-[#616061] text-sm truncate">
            {user?.status_text || "Available"}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 p-4">
        {isSelf ? (
          <Button
            type="button"
            onClick={handleSetStatus}
            variant="outline"
            className="w-full h-9 font-bold text-[13px] border-gray-300"
          >
            Set a status
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleRoute}
              variant="outline"
              className="flex-1 h-9 font-bold text-[13px] border-gray-300 gap-2"
            >
              <MessageSquare size={16} /> Message
            </Button>

            {/* <Button
              variant="outline"
              className="px-3 h-9 font-bold text-[13px] border-gray-300 gap-1.5"
            >
              <Headset size={16} /> Buzz
            </Button> */}
          </div>
        )}
      </div>
    </div>
  );
}
