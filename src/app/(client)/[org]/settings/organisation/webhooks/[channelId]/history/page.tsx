"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Hash, RefreshCw } from "lucide-react";
import SettingsLabel from "~/app/(client)/[org]/settings/components/settings-label";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest } from "~/utils/new-request";
import { useRBAC } from "~/hooks/useRBAC";
import { useChannelWebhook } from "~/hooks/useChannelWebhook";
import { useWebhookHistory } from "~/hooks/useWebhookHistory";
import WebhookHistoryTable from "~/app/(client)/[org]/_components/webhooks/webhook-history-table";
import Loading from "~/components/ui/loading";
import { Button } from "~/components/ui/button";

type ChannelListItem = {
  channels_id?: string;
  id?: string;
  name: string;
};

function resolveChannelId(channel: ChannelListItem) {
  return channel.channels_id || channel.id || "";
}

export default function WebhookHistoryPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug } = state;
  const channels = (state?.channels || []) as ChannelListItem[];

  const { hasPermission, status: rbacStatus } = useRBAC();
  const canManageWebhooks = hasPermission("create:webhooks");

  const channelNameFromState = useMemo(
    () =>
      channels.find((c) => resolveChannelId(c) === channelId)?.name ||
      localStorage.getItem("channelName") ||
      "channel",
    [channels, channelId]
  );

  const [channelName, setChannelName] = useState(channelNameFromState);

  useEffect(() => {
    setChannelName(channelNameFromState);
  }, [channelNameFromState]);

  useEffect(() => {
    if (channels.some((c) => resolveChannelId(c) === channelId)) return;

    const orgId = localStorage.getItem("orgId") || "";
    if (!orgId) return;

    const load = async () => {
      const res = await GetRequest(`/organisations/${orgId}/user-channels`);
      if (res?.status === 200 || res?.status === 201) {
        const list = res?.data?.data as ChannelListItem[];
        dispatch({ type: ACTIONS.CHANNELS, payload: list });
        const match = list?.find((c) => resolveChannelId(c) === channelId);
        if (match?.name) setChannelName(match.name);
      }
    };

    load();
  }, [channelId, channels, dispatch]);

  const { webhook, loading: webhookLoading } = useChannelWebhook(channelId);
  const {
    history,
    loading: historyLoading,
    fetchHistory,
  } = useWebhookHistory(channelId, webhook?.id);

  if (rbacStatus === "loading" || webhookLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loading color="#5757CD" height="36px" width="36px" />
      </div>
    );
  }

  if (!canManageWebhooks) {
    return (
      <div>
        <SettingsLabel />
        <div className="p-4 lg:px-8">
          <p className="text-sm text-[#667085]">
            You don&apos;t have access to webhook history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <SettingsLabel />
      <div className="p-4 lg:px-8">
        <Link
          href={`/${orgSlug}/settings/organisation/webhooks`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5757CD] hover:text-[#4545B0] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to webhooks
        </Link>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#3538CD] mb-2">
              <Hash className="h-3.5 w-3.5" />
              {channelName}
            </div>
            <h1 className="text-xl font-bold text-[#101828]">
              Delivery history
            </h1>
            <p className="text-sm text-[#667085] mt-1">
              {webhook?.webhook_name
                ? `Attempts for ${webhook.webhook_name}`
                : "Webhook delivery attempts for this channel"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchHistory()}
            disabled={historyLoading || !webhook?.id}
            className="border-[#D0D5DD] text-[#344054] shrink-0"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${historyLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {!webhook ? (
          <div className="rounded-2xl border border-[#E6EAEF] bg-[#F9FAFB] p-10 text-center">
            <p className="text-sm text-[#667085]">
              No webhook configured for this channel yet.
            </p>
            <Link
              href={`/${orgSlug}/settings/organisation/webhooks`}
              className="inline-block mt-4 text-sm font-semibold text-[#5757CD]"
            >
              Manage webhooks
            </Link>
          </div>
        ) : (
          <WebhookHistoryTable history={history} isLoading={historyLoading} />
        )}
      </div>
    </div>
  );
}
