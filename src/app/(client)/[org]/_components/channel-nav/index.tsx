"use client";

import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { EllipsisVertical, PlusIcon } from "lucide-react";
import React, { useContext, useRef, useState } from "react";

import { ACTIONS } from "~/store/Actions";
import { Button } from "~/components/ui/button";
import CallButton from "../buzz-management/call-button";
import ChannelDetailsDialog from "../channel-details-dialog";
import { DataContext } from "~/store/GlobalState";
import MenuDropdown from "./menu-dropdown";
import Tooltips from "../tooltip";
import { PostRequest } from "~/utils/new-request";
import { showError } from "~/components/toast/sonner";
import { useParams } from "next/navigation";

const ChannelHeader = () => {
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useContext(DataContext);
  const { channelDetails, user } = state;

  const id = useParams().id as string;

  const [startLoading, setStartLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    let extractedId = channelDetails?.active_buzz?.buzz_id;

    const isAlreadyInCurrentBuzz =
      state?.hasJoined &&
      String(state?.buzzData?.buzz_id || "") === String(extractedId || "");

    if (isAlreadyInCurrentBuzz) {
      dispatch({ type: ACTIONS.BUZZ_VIEW, payload: "side" });
      dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: true });
      return;
    }

    setJoinLoading(true);

    const joinRes = await PostRequest(`/buzz/${extractedId}/join`);

    if (joinRes.status === 200 || joinRes.status === 201) {
      dispatch({ type: ACTIONS.BUZZ_DATA, payload: joinRes.data.data });

      dispatch({
        type: ACTIONS.BUZZ_PARTICIPANTS,
        payload: joinRes.data.data.participants,
      });

      dispatch({ type: ACTIONS.HAS_JOINED, payload: true });
      dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: true });

      setJoinLoading(false);
    } else {
      setJoinLoading(false);
    }
  };

  const handleStartBuzz = async () => {
    setStartLoading(true);
    try {
      const createRes = await PostRequest("/buzz/create", { channel_id: id });
      const buzzId = createRes.data.data.buzz_code;

      const joinRes = await PostRequest(`/buzz/${buzzId}/join`);
      if (joinRes.status === 200 || joinRes.status === 201) {
        const localUserAsParticipant = {
          user_id: user?.user_id,
          username: user?.username || "You",
          avatar_url: user?.avatar_url,
          audioTrack: null,
          videoTrack: null,
          handsRaised: false,
          isPinned: false,
        };
        dispatch({
          type: ACTIONS.BUZZ_PARTICIPANTS,
          payload: [localUserAsParticipant],
        });
        dispatch({ type: ACTIONS.BUZZ_DATA, payload: joinRes.data.data });
        dispatch({ type: ACTIONS.HAS_JOINED, payload: true });
        dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: true });

        setStartLoading(false);
      }
    } catch (error) {
      showError("Failed to create meeting. Please try again.");
      setStartLoading(false);
    }
  };

  //

  return (
    <nav className="flex items-center flex-wrap justify-between px-3 py-3 md:p-5 border-b border-[#E6EAEF]">
      <ChannelDetailsDialog>
        <Tooltips side="bottom" text="Get channel details">
          <h2 className="text-base lg:text-lg font-bold hover:bg-gray-100 px-2 py-1 rounded-md">
            {channelDetails?.name ? "#" : ""} {channelDetails?.name}
          </h2>
        </Tooltips>
      </ChannelDetailsDialog>

      {!state?.channelloading &&
        state?.channelDetails?.access === true &&
        !state?.channelDetails?.archived && (
          <div className="flex items-center gap-3">
            <div className="flex gap-3 items-center relative">
              {!state?.hasJoined && (
                <div>
                  <CallButton
                    onClick={
                      channelDetails?.active_buzz ? handleJoin : handleStartBuzz
                    }
                    isActive={channelDetails?.active_buzz}
                    startLoading={startLoading}
                    joinLoading={joinLoading}
                  />
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-[#E6EAEF] hidden lg:block" />

            {/* avatar badge group */}
            <ChannelDetailsDialog>
              <div
                onClick={() =>
                  dispatch({ type: ACTIONS.ACTIVE_TAB, payload: "people" })
                }
                className="hidden lg:flex rounded-[5px] border border-[#E6EAEF] p-2 h-9 cursor-pointer hover:bg-gray-50"
              >
                <Tooltips side="bottom" text="View all members of this channel">
                  <div className="flex items-center gap-1.5">
                    {channelDetails?.users
                      ?.slice(0, 3)
                      .map((member: any, index: number) => (
                        <Avatar
                          key={member.id}
                          className={`rounded-[5px] w-5 h-5 border border-[#E6EAEF] object-cover ${
                            index > 0 ? "-ml-2.5" : ""
                          }`}
                        >
                          <AvatarImage
                            src={
                              member?.profile?.avatar_url ||
                              member?.profile?.default_avatar_url ||
                              "/images/user.png"
                            }
                            className="object-cover"
                          />
                        </Avatar>
                      ))}

                    {channelDetails?.users?.length > 3 && (
                      <span className="text-[13px] font-semibold text-[#344054]">
                        +{channelDetails.users.length - 3}
                      </span>
                    )}
                  </div>
                </Tooltips>
              </div>
            </ChannelDetailsDialog>

            <div className="relative" ref={menuDropdownRef}>
              <Tooltips side="bottom" text="More actions">
                <Button
                  variant="outline"
                  className={`p-2 border-[#E6EAEF] h-9 ${
                    isMenuDropdownOpen ? "bg-[#F6F7F9]" : ""
                  }`}
                  onClick={() => setIsMenuDropdownOpen((prev) => !prev)}
                >
                  <EllipsisVertical className="w-5 h-5" color="#344054" />
                </Button>
              </Tooltips>

              <MenuDropdown
                isOpen={isMenuDropdownOpen}
                onClose={() => setIsMenuDropdownOpen(false)}
              />
            </div>
          </div>
        )}
    </nav>
  );
};

export default ChannelHeader;
