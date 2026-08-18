"use client";

import { useParams } from "next/navigation";
import { useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import ChannelWebhookPanel from "./channel-webhook-panel";

export function WebhooksTabContainer() {
  const params = useParams();
  const channelId = params.id as string;
  const { state } = useContext(DataContext);
  const channelName =
    state?.channelDetails?.name ||
    localStorage.getItem("channelName") ||
    "channel";

  return (
    <div className="max-h-[28rem] overflow-y-auto pr-1">
      <ChannelWebhookPanel
        channelId={channelId}
        channelName={channelName}
        variant="compact"
      />
    </div>
  );
}
