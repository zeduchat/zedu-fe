"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { User, UserItem } from "./buzz-userItems";
import CombinedInviteInput from "./combineInput";
import { DataContext } from "~/store/GlobalState";
import axios from "axios";
import { createPortal } from "react-dom";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (user: User) => void;
  onRemove: (user: User) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  onRemove,
}) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"suggested" | "invited">(
    "suggested"
  );
  // const token = localStorage.getItem("token") || "";
  const { state } = useContext(DataContext);
  const { buzzParticipants } = state;
  const [selected, setSelected] = useState<User[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const orgMembers = useMemo<User[]>(
    () => state.orgMembers ?? [],
    [state.orgMembers]
  );
  const getSearchKey = (u: User) =>
    (u.name || u.username || u.email || "").toLowerCase();

  useEffect(() => {
    if (!isOpen) {
      setSelected([]);
      setSearch("");
      setHighlightIndex(0);
    }
  }, [isOpen]);

  const filteredSuggested = useMemo(() => {
    return orgMembers.filter((user) => {
      const key = getSearchKey(user);

      const matchesSearch = key.includes(search.toLowerCase());

      const isSelf = String(user.id) === String(state?.user?.user_id);

      const isAlreadySelected = selected.some((s) => s.id === user?.id);

      const isAlreadyInCall = buzzParticipants.some(
        (p: any) => String(p.uid) === String(user?.id)
      );
      return matchesSearch && !isSelf && !isAlreadyInCall && !isAlreadySelected;
    });
  }, [orgMembers, search, selected, buzzParticipants, state?.user?.user_id]);

  const filteredInvited = useMemo(() => {
    const inCallUsers = orgMembers.filter((user) =>
      buzzParticipants.some((p: any) => String(p.uid) === String(user.id))
    );
    const merged = [...selected, ...inCallUsers];
    const deduped: User[] = [];
    const seen = new Set<string>();

    for (const u of merged) {
      const id = String(u.id);
      if (!seen.has(id)) {
        seen.add(id);
        deduped.push(u);
      }
    }

    return deduped.filter((user) => {
      const key = getSearchKey(user);
      return key.includes(search.toLowerCase());
    });
  }, [selected, search, orgMembers, buzzParticipants]);

  const handleSelectUser = (user: User) => {
    if (!selected.some((u) => u.id === user.id)) {
      setSelected((prev) => [...prev, user]);
    }
    setSearch("");
  };

  // Handle removing a user from selected tags
  const handleRemoveUser = (user: User) => {
    setSelected((prev) => prev.filter((u) => u.id !== user.id));
    onRemove(user);
  };

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setHighlightIndex((i) => (i + 1 < filteredSuggested.length ? i + 1 : i));
    }
    if (e.key === "ArrowUp") {
      setHighlightIndex((i) => (i - 1 >= 0 ? i - 1 : 0));
    }
    if (e.key === "Enter") {
      const user = filteredSuggested[highlightIndex];
      if (user) handleSelectUser(user);
    }
  };

  const handleSendInvite = async (buzzId: string, inviteeIds: string[]) => {
    const invited = inviteeIds.map((u) => ({ profileId: u, name: "" }));
    try {
      // await sendInvite(invited);
      // const response = await InviteRequest("/buzz/invite", {
      //   buzz_id: buzzId,
      //   invitee_ids: inviteeIds,
      // });
      // if (response?.data?.status === "success") {
      // }
      // return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
    }
  };

  if (!isOpen) return null;

  const EmptyInvited = () => (
    <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
      <p className="text-sm">No invited users yet</p>
      <p className="text-xs mt-1">Select people from the Suggested tab</p>
    </div>
  );

  // const isPendingInvite = (userId: string) => {
  //   if (!pendingInvites) return false;
  //   return pendingInvites.has(String(userId));
  // };

  const EmptySuggestionForInvitation = () => (
    <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
      <p className="text-sm">No new suggestion available</p>
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100000]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-[400px] md:w-[547px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className=" px-6 pt-6 border-b border-[#E6EAEF] ">
          <h2 className="text-lg font-semibold mb-4">Invite people to Buzz</h2>
          <p className="text-sm text-gray-600 mb-4">
            Find people from outside this conversation and invite them to this
            buzz call
          </p>
        </div>

        {/* Search Box */}
        <div className="px-6 py-6">
          <p className="font-medium leading-4 text-[#1D2939] pb-2 text-[15px]">
            Add
          </p>
          <CombinedInviteInput
            selected={selected}
            onKeyDown={handleKeyNav}
            onRemove={handleRemoveUser}
            search={search}
            onSearchChange={setSearch}
          />

          {/* Tabs */}
          <div className="flex gap-6 border-b mb-3 pt-4">
            <button
              className={`pb-2 ${
                activeTab === "suggested"
                  ? "border-b-2 border-[#5F5FE1] font-medium"
                  : ""
              }`}
              onClick={() => setActiveTab("suggested")}
            >
              Suggested
            </button>
            <button
              className={`pb-2 ${
                activeTab === "invited"
                  ? "border-b-2 border-[#5F5FE1] font-medium"
                  : ""
              }`}
              onClick={() => setActiveTab("invited")}
            >
              Invited
            </button>
          </div>

          <div className="max-h-[260px] overflow-y-auto pr-2">
            {activeTab === "suggested" &&
              (filteredSuggested.length === 0 ? (
                <EmptySuggestionForInvitation />
              ) : (
                filteredSuggested.map((user: any, index) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    onClick={() => handleSelectUser(user)}
                    active={index === highlightIndex}
                    // pending={isPendingInvite(String(user.id))}
                  />
                ))
              ))}

            {activeTab === "invited" &&
              (filteredInvited.length === 0 ? (
                <EmptyInvited />
              ) : (
                filteredInvited.map((user: any, index) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    onClick={() => handleRemoveUser(user)}
                    active={index === highlightIndex}
                  />
                ))
              ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border rounded-md">
              Cancel
            </button>

            <button
              className={`px-4 py-2 ${selected.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-[#5F5FE1] text-white"}   rounded-md`}
              disabled={selected.length === 0}
              // onClick={() => {
              //   handleSendInvite(
              //     buzzId,
              //     selected.map((u) => u.id)
              //   );
              //   setSelected([]);
              //   setSearch("");
              //   onClose();
              // }}
            >
              Send Invitations
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
