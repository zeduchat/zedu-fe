"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { User, UserItem } from "./buzz-userItems";
import CombinedInviteInput from "./combineInput";
import { DataContext } from "~/store/GlobalState";
import { createPortal } from "react-dom";
import { InviteRequest } from "~/utils/new-request";
import { showSuccess } from "~/components/toast/sonner";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const matchesBuzzParticipant = (participant: any, userId: string) =>
  String(participant?.user_id) === String(userId) ||
  String(participant?.uid) === String(userId) ||
  String(participant?.id) === String(userId);

const mergeUsers = (users: User[]) => {
  const deduped: User[] = [];
  const seen = new Set<string>();

  for (const user of users) {
    const id = String(user.id);
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(user);
  }

  return deduped;
};

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [invited, setInvited] = useState<User[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const { buzzParticipants } = state;
  const [selected, setSelected] = useState<User[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const orgMembers = useMemo<User[]>(
    () => state.orgMembers ?? [],
    [state.orgMembers]
  );
  const { buzzData } = state;

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"suggested" | "invited">(
    "suggested"
  );

  const getSearchKey = (u: User) =>
    (u.name || u.username || u.email || "").toLowerCase();

  useEffect(() => {
    if (!isOpen) {
      setSelected([]);
      setSearch("");
      setHighlightIndex(0);
      setInvited([]);
      return;
    }

    const pendingInvitedUsers = orgMembers.filter((user) =>
      buzzParticipants.some(
        (participant: any) =>
          matchesBuzzParticipant(participant, user.id) &&
          participant?.join_status &&
          !["accept", "accepted"].includes(participant.join_status)
      )
    );

    setInvited((prev) => mergeUsers([...prev, ...pendingInvitedUsers]));
  }, [isOpen, orgMembers, buzzParticipants]);

  const filteredSuggested = useMemo(() => {
    return orgMembers.filter((user) => {
      const key = getSearchKey(user);

      const matchesSearch = key.includes(search.toLowerCase());

      const isSelf = String(user.id) === String(state?.user?.user_id);

      const isAlreadySelected = selected.some((s) => s.id === user?.id);

      const isAlreadyInvited = invited.some((s) => s.id === user?.id);

      const isAlreadyInCall = buzzParticipants.some((participant: any) =>
        matchesBuzzParticipant(participant, user.id)
      );
      return (
        matchesSearch &&
        !isSelf &&
        !isAlreadyInCall &&
        !isAlreadySelected &&
        !isAlreadyInvited
      );
    });
  }, [
    orgMembers,
    search,
    selected,
    invited,
    buzzParticipants,
    state?.user?.user_id,
  ]);

  const filteredInvited = useMemo(() => {
    const invitedFromParticipants = orgMembers.filter((user) =>
      buzzParticipants.some((participant: any) =>
        matchesBuzzParticipant(participant, user.id)
      )
    );
    const merged = mergeUsers([
      ...selected,
      ...invited,
      ...invitedFromParticipants,
    ]);

    return merged.filter((user) => {
      const key = getSearchKey(user);
      return key.includes(search.toLowerCase());
    });
  }, [selected, invited, search, orgMembers, buzzParticipants]);

  const handleSelectUser = (user: User) => {
    if (!selected.some((u) => u.id === user.id)) {
      setSelected((prev) => [...prev, user]);
    }
    setSearch("");
  };

  // Handle removing a user from selected tags
  const handleRemoveUser = (user: User) => {
    setSelected((prev) => prev.filter((u) => u.id !== user.id));
    setInvited((prev) => prev.filter((u) => u.id !== user.id));
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

  const handleSendInvite = async (inviteeIds: string[]) => {
    setInviteLoading(true);

    try {
      const response = await InviteRequest("/buzz/invite", {
        buzz_id: buzzData?.buzz_id,
        invitee_ids: inviteeIds,
      });

      if (response?.status === 200 || response?.status === 201) {
        const invitedUsers = selected.filter((user) =>
          inviteeIds.includes(String(user.id))
        );

        setInvited((prev) => mergeUsers([...prev, ...invitedUsers]));

        if (Array.isArray(response?.data?.data?.participants)) {
          dispatch({
            type: ACTIONS.BUZZ_PARTICIPANTS,
            payload: response.data.data.participants,
          });
        }

        showSuccess(response?.data?.message || "Invitations sent");
        setSelected([]);
        setSearch("");
        setActiveTab("invited");
      }
    } catch (error) {
      console.error("Failed to send buzz invites:", error);
    } finally {
      setInviteLoading(false);
    }
  };

  const isPendingInvite = (userId: string) => {
    const participant = buzzParticipants.find((p: any) =>
      matchesBuzzParticipant(p, userId)
    );

    if (participant?.join_status) {
      return !["accept", "accepted"].includes(participant.join_status);
    }

    return invited.some((user) => String(user.id) === String(userId));
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
      className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-[400px] md:w-[547px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className=" px-6 pt-6">
          <h2 className="text-lg font-semibold mb-4">Invite people to Buzz</h2>
          <p className="text-sm mb-4">
            Find people from outside this conversation and invite them to this
            buzz call
          </p>
        </div>

        {/* Search Box */}
        <div className="px-6 py-6">
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
                    pending={isPendingInvite(String(user.id))}
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
              className={`flex items-center gap-3 px-4 py-2 ${selected.length === 0 ? "bg-gray-300 text-black cursor-not-allowed" : "bg-[#5F5FE1] text-white"}   rounded-md`}
              disabled={selected.length === 0}
              onClick={() => {
                handleSendInvite(selected.map((u) => u.id));
              }}
            >
              {inviteLoading && <Loading />}
              Send Invitations
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
