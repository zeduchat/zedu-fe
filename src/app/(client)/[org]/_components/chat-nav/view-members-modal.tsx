"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";
import UserAvatar from "~/components/layout/user-avatar";
import { Input } from "~/components/ui/input";

type GroupParticipant = {
  user_id?: string | number;
  id?: string | number;
  username?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  default_avatar_url?: string;
  online?: boolean;
};

interface ViewMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  participants?: GroupParticipant[] | null;
}

const normalizeParticipants = (
  participants: ViewMembersModalProps["participants"]
): GroupParticipant[] => {
  if (Array.isArray(participants)) return participants;
  return [];
};

const memberDisplayName = (member: GroupParticipant) =>
  member.username || member.name || member.email || "Member";

const memberSearchKey = (member: GroupParticipant) =>
  `${member.username || ""} ${member.name || ""} ${member.email || ""}`.toLowerCase();

export const ViewMembersModal: React.FC<ViewMembersModalProps> = ({
  isOpen,
  onClose,
  channelId,
  participants,
}) => {
  const { state } = useContext(DataContext);
  const orgId =
    state.orgId ||
    (typeof window !== "undefined" ? localStorage.getItem("orgId") || "" : "");

  const [members, setMembers] = useState<GroupParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      return;
    }

    const initial = normalizeParticipants(participants);
    const fromState = normalizeParticipants(
      state.participants as GroupParticipant[]
    );
    setMembers(initial.length > 0 ? initial : fromState);

    if (!orgId || !channelId) return;

    let cancelled = false;

    const fetchMembers = async () => {
      setLoading(true);
      const res = await GetRequest(
        `/organisations/${orgId}/dms/participants/${channelId}`
      );

      if (!cancelled && (res?.status === 200 || res?.status === 201)) {
        const list = res?.data?.data?.participants;
        if (Array.isArray(list)) {
          setMembers(list);
        }
      }
      if (!cancelled) setLoading(false);
    };

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [isOpen, orgId, channelId, participants, state.participants]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => memberSearchKey(member).includes(query));
  }, [members, search]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-group-members-title"
        className="bg-white rounded-xl shadow-lg w-[400px] md:w-[547px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="view-group-members-title"
              className="text-lg font-semibold text-[#101828]"
            >
              Group members
            </h2>
            <p className="text-sm text-[#667085] mt-1">
              {members.length} {members.length === 1 ? "member" : "members"} in
              this conversation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 text-[#344054]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-4">
          <Input
            type="search"
            placeholder="Find a member"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="px-6 pb-6 flex-1 min-h-0 overflow-y-auto max-h-[360px]">
          {loading && members.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loading />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#667085]">
              {search.trim()
                ? "No members match your search"
                : "No members yet"}
            </div>
          ) : (
            <ul className="divide-y divide-[#E6EAEF]">
              {filteredMembers.map((member) => {
                const id = String(
                  member.user_id ?? member.id ?? member.username
                );
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 py-3 first:pt-0"
                  >
                    <div className="relative shrink-0">
                      <UserAvatar
                        src={member.avatar_url}
                        defaultAvatarUrl={member.default_avatar_url}
                        alt={memberDisplayName(member)}
                        size="sm"
                        className="rounded-[7px]"
                      />
                      <span
                        className={`absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          member.online ? "bg-[#00AD51]" : "bg-[#F97316]"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#101828] text-[15px] truncate">
                        {memberDisplayName(member)}
                      </p>
                      {member.username &&
                        member.name &&
                        member.username !== member.name && (
                          <p className="text-sm text-[#667085] truncate">
                            @{member.username}
                          </p>
                        )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {loading && members.length > 0 && (
            <div className="flex justify-center py-3">
              <Loading />
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end border-t border-[#E6EAEF] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#E6EAEF] rounded-md text-[#101828] hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
