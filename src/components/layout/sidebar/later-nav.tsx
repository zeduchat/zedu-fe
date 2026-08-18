"use client";

import React, { useContext, useEffect, useRef } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { HashIcon, XIcon } from "lucide-react";
import Image from "next/image";
import images from "~/assets/images";
import { useParams, useRouter } from "next/navigation";
import OrganisationMenu from "~/app/(client)/[org]/_components/org-dropdown";
import { PostRequest } from "~/utils/new-request";
import { stripHtmlTags } from "~/utils/utils";
import { cn } from "~/lib/utils";
import { LockClosedIcon } from "@radix-ui/react-icons";

//

export default function LaterNav() {
  const { state, dispatch } = useContext(DataContext);
  const { later, dataId, orgSlug } = state;
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const memberRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const params = useParams();
  const id2 = params.id2 as string;
  const router = useRouter();

  // Restore scroll position after re-render
  useEffect(() => {
    const dataId = localStorage.getItem("data-id") || "";
    dispatch({ type: ACTIONS.DATA_ID, payload: dataId });

    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    if (sidebarRef.current && savedScroll) {
      sidebarRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [dispatch]);

  // Save scroll position before re-render
  const handleScroll = () => {
    if (sidebarRef.current) {
      sessionStorage.setItem(
        "sidebar-scroll",
        sidebarRef.current.scrollTop.toString()
      );
    }
  };

  const handleRoute = async (data: any) => {
    dispatch({ type: ACTIONS.DATA_ID, payload: data?.id });
    localStorage.setItem("data-id", data?.id);

    if (
      data?.channel_type === "Public" ||
      data?.channel_type === "Private Channel"
    ) {
      handleChannel(data);
    }

    if (data?.channel_type === "Direct Message") {
      handleDM(data);
    }

    if (data?.channel_type === "Group Direct Message") {
      handleGroupDm(data);
    }
  };

  // Channel function
  const handleChannel = async (data: any) => {
    localStorage.setItem("channelName", data?.channel_name);
    localStorage.setItem("channelId", data?.channel_id);
    router.push(`/${orgSlug}/later/channels/${data?.channel_id}`);
  };

  const handleGroupDm = async (data: any) => {
    localStorage.setItem("channelName", data?.channel_name);
    localStorage.setItem("channelId", data?.channel_id);
    router.push(`/${orgSlug}/later/dms/${data?.channel_id}`);
  };

  const handleDM = async (data: any) => {
    localStorage.setItem("channelName", data?.channel_name);
    localStorage.setItem("channelId", data?.channel_id);

    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      chat_type: "user",
      participant_id: data?.id,
    };

    const res = await PostRequest(`/organisations/${orgId}/dms`, payload);

    if (res?.status === 200 || res?.status === 201) {
      router.push(
        `/${orgSlug}/later/dm/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}`
      );
    }
  };

  useEffect(() => {
    if (id2 && memberRefs.current[id2]) {
      memberRefs.current[id2]?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }
  }, [id2, later]);

  //

  return (
    <>
      <div
        className={`fixed top-[60px] lg:rounded-tl-[8px] lg:rounded-bl-[8px] bottom-[60px] left-0 lg:left-[85px] h-[100dvh] bg-blue-300 lg:translate-x-0 ${state?.channelBar === true && state?.openSidebar ? "translate-x-[85px]" : state?.channelBar === true && !state?.openSidebar ? "translate-x-0" : "-translate-x-full "}
      pt-4 flex flex-col gap-6 sm:w-[350px] transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="flex items-center justify-between px-3 ">
          <div className="flex items-center gap-[5px] md:justify-between w-full">
            <OrganisationMenu name="Later" />
          </div>

          <XIcon
            className="block md:hidden text-gray-500 cursor-pointer"
            onClick={() =>
              dispatch({ type: ACTIONS.CHANNEL_BAR, payload: false })
            }
          />
        </div>

        <div
          className="overflow-auto [&::-webkit-scrollbar]:hidden text-blue-50 cursor-pointer pb-40"
          ref={sidebarRef}
          onScroll={handleScroll}
          onClick={() =>
            dispatch({ type: ACTIONS.CHANNEL_BAR, payload: false })
          }
        >
          <div className="flex flex-col">
            {later?.map((item: any, index: number) => {
              const isActive = item?.id === dataId;
              return (
                <div
                  key={index}
                  className={`px-3 py-4 hover:bg-[#4B4BB4] border-t border-gray-500 ${isActive ? "bg-[#4B4BB4]" : ""}`}
                  onClick={() => handleRoute(item)}
                >
                  <div className="flex-1 flex items-center gap-1 mb-3">
                    {item?.channel_type === "Private Channel" ? (
                      <LockClosedIcon
                        className={cn(
                          "size-3",
                          isActive ? "text-white" : "text-blue-50"
                        )}
                      />
                    ) : (
                      <HashIcon
                        className={cn(
                          "size-3",
                          isActive ? "text-white" : "text-blue-50"
                        )}
                      />
                    )}

                    <p
                      className={cn(
                        "text-[13px] leading-4 lowercase truncate w-[180px]",
                        isActive ? "font-semibold text-white" : "text-blue-50"
                      )}
                      title={item?.channel_name}
                    >
                      {item?.channel_name}
                    </p>
                  </div>

                  <div
                    ref={(el) => {
                      memberRefs.current[item?.id] = el;
                    }}
                    className={`flex items-start gap-3`}
                  >
                    <div className="relative size-8 rounded-[5px] border overflow-hidden">
                      <Image
                        width={36}
                        height={36}
                        src={
                          item?.avatar_url
                            ? item?.avatar_url
                            : item?.entity_type == "user" ||
                                item?.entity_type === ""
                              ? images?.user
                              : images?.bot
                        }
                        className="rounded-[5px] size-8 object-cover"
                        alt={item?.username}
                      />
                    </div>

                    <div className="-mt-1">
                      <span className="text-[15px] font-semibold text-white break-words max-w-[300px] line-clamp-2">
                        {item?.username}
                      </span>

                      <p className="text-[14px] text-[#D0D0FD] break-words max-w-[230px] line-clamp-2">
                        {stripHtmlTags(item?.content)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {later.length === 0 && (
              <p className="self-center mt-10">No available data</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
