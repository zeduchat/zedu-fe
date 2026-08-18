"use client";
import React, { useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import { useRouter } from "next/navigation";
import { ACTIONS } from "~/store/Actions";
import { Button } from "~/components/ui/button";
import { PlusIcon, UserPlusIcon } from "lucide-react";
import { RequirePermission } from "~/components/rbac/RequirePermission";

const AllPeopleHeader = () => {
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug } = state;
  const router = useRouter();

  const handleInvite = () => {
    dispatch({ type: ACTIONS.INVITE_MODAL, payload: true });
  };

  const newChat = () => {
    router.push(`/${orgSlug}/home/people/new-chat`);
  };

  //

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 border-b border-[#E6EAEF]">
      <h2 className="text-[#1D2939] text-base lg:text-lg font-bold">People</h2>

      <div className="flex items-center gap-3">
        <RequirePermission permission="invite:members">
          <Button
            variant="outline"
            className="border h-9"
            onClick={handleInvite}
          >
            <UserPlusIcon className="w-5 h-5" />
            <span className="ml-1 text-[13px] font-semibold">
              Invite People
            </span>
          </Button>
        </RequirePermission>

        <Button
          variant="outline"
          className="border-blue-50 h-9"
          onClick={newChat}
        >
          <PlusIcon className="w-5 h-5" color="#8686F9" />
          <span className="ml-1 text-[13px] font-semibold text-blue-200">
            New Chat
          </span>
        </Button>
      </div>
    </nav>
  );
};

export default AllPeopleHeader;
