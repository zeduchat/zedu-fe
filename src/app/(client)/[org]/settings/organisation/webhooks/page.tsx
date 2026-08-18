"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { Hash, Lock, Search, Webhook } from "lucide-react";
import SettingsLabel from "../../components/settings-label";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest } from "~/utils/new-request";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useRBAC } from "~/hooks/useRBAC";
import ChannelWebhookPanel from "../../../_components/webhooks/channel-webhook-panel";
import Loading from "~/components/ui/loading";

type ChannelListItem = {
  channels_id?: string;
  id?: string;
  name: string;
  is_private?: boolean;
};

function resolveChannelId(channel: ChannelListItem) {
  return channel.channels_id || channel.id || "";
}

const OrganisationWebhooksPage = () => {
  const { state, dispatch } = useContext(DataContext);
  const { hasPermission, status: rbacStatus } = useRBAC();
  const canManageWebhooks = hasPermission("create:webhooks");

  const [search, setSearch] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null
  );
  const [channelsLoading, setChannelsLoading] = useState(false);

  const channels = (state?.channels || []) as ChannelListItem[];

  useEffect(() => {
    const orgId = localStorage.getItem("orgId") || "";
    if (!orgId || channels.length > 0) return;

    const loadChannels = async () => {
      setChannelsLoading(true);
      try {
        const res = await GetRequest(`/organisations/${orgId}/user-channels`);
        if (res?.status === 200 || res?.status === 201) {
          dispatch({ type: ACTIONS.CHANNELS, payload: res?.data?.data });
        }
      } finally {
        setChannelsLoading(false);
      }
    };

    loadChannels();
  }, [channels.length, dispatch]);

  const filteredChannels = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return channels;
    return channels.filter((c) => c.name?.toLowerCase().includes(q));
  }, [channels, search]);

  useEffect(() => {
    if (selectedChannelId) return;
    const first = filteredChannels[0];
    if (first) {
      setSelectedChannelId(resolveChannelId(first));
    }
  }, [filteredChannels, selectedChannelId]);

  const selectedChannel = channels.find(
    (c) => resolveChannelId(c) === selectedChannelId
  );

  if (rbacStatus === "loading") {
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
          <div className="rounded-2xl border border-[#E6EAEF] bg-[#F9FAFB] p-10 text-center max-w-lg">
            <Webhook className="mx-auto h-10 w-10 text-[#667085] mb-4" />
            <h2 className="text-lg font-bold text-[#101828]">
              Webhooks unavailable
            </h2>
            <p className="text-sm text-[#667085] mt-2">
              You don&apos;t have permission to manage webhooks. Ask an
              administrator to grant the &quot;Create webhooks&quot; permission.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <SettingsLabel />
      <div className="p-4 lg:px-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#101828]">
            Webhook management
          </h1>
          <p className="text-sm text-[#667085] mt-1 max-w-2xl">
            Configure incoming webhooks per channel. Select a channel to manage
            its endpoint and availability.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 min-h-[640px]">
          <aside className="xl:w-[320px] shrink-0 flex flex-col min-h-[640px] rounded-2xl border border-[#E6EAEF] bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E6EAEF] bg-[#F9FAFB] shrink-0">
              <h2 className="text-sm font-bold text-[#101828] mb-3">
                Channels
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                <Input
                  placeholder="Search channels..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-[#D0D5DD] bg-white"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-2">
              {channelsLoading ? (
                <div className="flex justify-center py-12">
                  <Loading color="#5757CD" height="24px" width="24px" />
                </div>
              ) : filteredChannels.length === 0 ? (
                <p className="text-sm text-[#667085] text-center py-8 px-4">
                  No channels found.
                </p>
              ) : (
                <ul className="space-y-1">
                  {filteredChannels.map((channel) => {
                    const id = resolveChannelId(channel);
                    const selected = id === selectedChannelId;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => setSelectedChannelId(id)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                            selected
                              ? "bg-[#5757CD] text-white shadow-md"
                              : "hover:bg-[#F2F4F7] text-[#344054]"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                              selected
                                ? "bg-white/20"
                                : "bg-[#EEF4FF] text-[#5757CD]"
                            )}
                          >
                            {channel.is_private ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Hash className="h-4 w-4" />
                            )}
                          </span>
                          <span className="truncate text-sm font-semibold capitalize">
                            {channel.name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {selectedChannelId && selectedChannel ? (
              <ChannelWebhookPanel
                key={selectedChannelId}
                channelId={selectedChannelId}
                channelName={selectedChannel.name}
                variant="full"
              />
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center rounded-2xl border border-dashed border-[#D0D5DD] bg-[#F9FAFB]">
                <p className="text-sm text-[#667085]">
                  Select a channel to manage its webhook.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrganisationWebhooksPage;
