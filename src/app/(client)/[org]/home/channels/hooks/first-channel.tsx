import { useState } from "react";
import { GetRequest } from "~/utils/new-request";

const useFirstChannel = () => {
  const [channelsId, setChannelsId] = useState("");

  // Function to fetch the first channel
  const firstChannel = async (orgId?: string) => {
    if (!orgId) return null;

    const res = await GetRequest(`/organisations/${orgId}/user-channels`);

    if (res?.status === 200 || res?.status === 201) {
      const channel = res?.data?.data[0];
      if (channel) {
        localStorage.setItem("channelId", channel.channels_id);
        localStorage.setItem("channelName", channel.name);
        setChannelsId(channel.channels_id);
      }
    }

    return res?.data?.data[0]?.channels_id;
  };

  return { firstChannel, channelsId };
};

export default useFirstChannel;
