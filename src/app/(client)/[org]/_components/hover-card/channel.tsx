import { Hash, Users, Clock } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { GetRequest } from "~/utils/new-request";
import { Channel } from "~/types/channel";
import { useRouter } from "next/navigation";
import { DataContext } from "~/store/GlobalState";

export default function ChannelHoverCardContent({
  channelId,
}: {
  channelId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<Channel | null>(null);

  const { state } = useContext(DataContext);
  const { orgSlug } = state;
  const router = useRouter();

  useEffect(() => {
    if (channelId) {
      const fetchChannelById = async () => {
        const res = await GetRequest(`/channels/${channelId}`);
        if (res?.status === 200 || res?.status === 201) {
          setChannel(res.data.data);
        }
        setLoading(false);
      };
      fetchChannelById();
    }
  }, [channelId]);

  const selectChannel = () => {
    localStorage.setItem("channelId", channel?.channels_id || "");
    localStorage.setItem("channelName", channel?.name || "");

    router.push(`/${orgSlug}/home/channels/${channel?.channels_id}`);
  };

  if (loading) {
    return (
      <div className="max-w-[300px] w-full p-5 bg-white animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-5 bg-gray-200 rounded" />
          <div className="h-5 w-32 bg-gray-200 rounded" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-4 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>

          <div className="flex items-center gap-3">
            <div className="size-4 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="h-10 w-full mt-6 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-[300px] w-full p-5 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="size-5 text-black stroke-[3.5px]" />
        <h3 className="font-black text-[18px] text-black tracking-tight">
          {channel?.name}
        </h3>
      </div>

      <div className="space-y-3.5 text-[#616061] text-[15px]">
        <div className="flex items-center gap-3">
          <Users size={18} strokeWidth={2.5} />
          <span>
            <strong className="text-black font-semibold">
              {channel?.user_count}
            </strong>{" "}
            people in this channel
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Clock size={18} strokeWidth={2.5} />
          <span>Last message on Feb 20th</span>
        </div>
      </div>

      <Button
        onClick={selectChannel}
        variant="outline"
        className="w-full mt-6 h-10 border-gray-300 text-black font-bold text-[14px] rounded-lg"
      >
        View Channel
      </Button>
    </div>
  );
}
