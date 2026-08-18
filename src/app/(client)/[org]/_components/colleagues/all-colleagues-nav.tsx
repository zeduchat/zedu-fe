"use client";
import React, { useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { Button } from "~/components/ui/button";
import { UserPlusIcon } from "lucide-react";
import { RequirePermission } from "~/components/rbac/RequirePermission";

const AllColleaguesHeader = () => {
  const { dispatch } = useContext(DataContext);

  const handleInvite = () => {
    dispatch({ type: ACTIONS.INVITE_MODAL, payload: true });
  };

  //

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 border-b border-[#E6EAEF]">
      <h2 className="text-[#1D2939] text-base lg:text-lg font-bold">
        AI Coworkers
      </h2>

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
      </div>
    </nav>
  );
};

export default AllColleaguesHeader;
