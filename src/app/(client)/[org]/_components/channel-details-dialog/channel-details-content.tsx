import React, { useContext, useMemo, useState } from "react";
import { useRBAC } from "~/hooks/useRBAC";
import { Button } from "~/components/ui/button";
import { DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BellSimpleSlashIcon, StarIcon } from "~/svgs";
import {
  AboutTabContainer,
  PeopleTabContainer,
  AgentsTabContainer,
} from "./channel-details-tabs-content";
import FilesTabContainer from "./files-tab-container";
import { WebhooksTabContainer } from "../webhooks/webhooks-tab-container";
import { cn } from "~/lib/utils";
import { DataContext } from "~/store/GlobalState";

export const ChannelDetailsContent = ({ setIsOpen }: any) => {
  const { state } = useContext(DataContext);
  const { hasPermission } = useRBAC();
  const canManageWebhooks = hasPermission("create:webhooks");
  const [muted, setMuted] = useState(false);
  const [starred, setStarred] = useState(false);
  const [activeTab, setActiveTab] = useState(state?.activeTab);

  const TABS_LIST = useMemo(() => {
    const tabs = [
      { name: "about", notifs: 0 },
      { name: "people", notifs: state?.channelDetails?.users?.length || 0 },
      { name: "agents", notifs: state?.channelAgents?.length || 0 },
      { name: "files", notifs: 0 },
    ];
    if (canManageWebhooks) {
      tabs.push({ name: "webhooks", notifs: 0 });
    }
    return tabs;
  }, [
    canManageWebhooks,
    state?.channelDetails?.users?.length,
    state?.channelAgents?.length,
  ]);

  const TABS_CONTENT = useMemo(() => {
    const content = [
      { name: "about", Component: AboutTabContainer },
      { name: "people", Component: PeopleTabContainer },
      { name: "agents", Component: AgentsTabContainer },
      { name: "files", Component: FilesTabContainer },
    ];
    if (canManageWebhooks) {
      content.push({ name: "webhooks", Component: WebhooksTabContainer });
    }
    return content;
  }, [canManageWebhooks]);

  const handleMute = async () => {
    setMuted(!muted);
    // const res = await PostRequest("/");
    // if (res.status === 200 || res.status === 201) {
    // }
  };

  const handleStarred = async () => {
    setStarred(!starred);
    // const res = await PostRequest("/");
    // if (res.status === 200 || res.status === 201) {
    // }
  };

  return (
    <section className="overflow-hidden h-[600px]">
      <DialogHeader className="py-5 px-6 space-y-3.5 border-b border-[#E6EAEF]">
        <DialogTitle className="font-black text-[#1D2939] text-lg lg:text-[1.375rem] leading-8">
          # {state?.channelDetails?.name}
        </DialogTitle>

        <div className="flex items-center space-x-3 overflow-auto">
          <Button
            variant={"outline"}
            className={`h-fit p-[0.435rem] font-semibold text-[0.8125rem] text-[#344054] gap-1 ${starred ? "border-primary-500" : ""}`}
            onClick={handleStarred}
          >
            <StarIcon color={starred ? "rgb(113, 65, 248)" : ""} />
          </Button>

          <Button
            variant={"outline"}
            className={`h-fit p-[0.435rem] px-3 font-semibold text-[0.8125rem] text-[#344054] gap-1 ${muted ? "border-primary-500" : ""}`}
            onClick={handleMute}
          >
            <BellSimpleSlashIcon color={muted ? "rgb(113, 65, 248)" : ""} />{" "}
            Mute
          </Button>
        </div>
      </DialogHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-0"
      >
        <div className="overflow-x-auto overflow-y-hidden">
          <TabsList className="p-0 px-6 h-fit bg-transparent justify-start gap-8 w-[450px] sm:w-full">
            {TABS_LIST.map(({ name, notifs }) => (
              <TabsTrigger
                key={name}
                value={name}
                onClick={(e) => e.stopPropagation()}
                className="-mb-[1.5px] py-2.5 px-1 font-bold capitalize rounded-none border-b-2 border-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500"
              >
                {name}
                {notifs != 0 && (
                  <div className="ml-1.5 w-[1.375rem] aspect-square flex justify-center items-center rounded-full text-[#5757CD] bg-[#F2F4F7]">
                    {notifs}
                  </div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS_CONTENT.map(({ name, Component }) => (
          <TabsContent key={name} value={name}>
            <TabContainer
              className={
                name === "about"
                  ? "bg-[#F6F7F9] dark:bg-[#1A1D21] min-h-[32rem]"
                  : ""
              }
            >
              <Component setIsOpen={setIsOpen} />
            </TabContainer>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

function TabContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-2 sm:px-6 py-5 border-t border-[#E6EAEF] rounded-b-[0.625rem]",
        className
      )}
    >
      {children}
    </div>
  );
}
