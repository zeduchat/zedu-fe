"use client";
import { EllipsisVertical } from "lucide-react";
import React, { useState, useRef, useContext } from "react";
import { Button } from "~/components/ui/button";
import MenuDropdown from "./menu-dropdown";
import Image from "next/image";
import images from "~/assets/images";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import DeleteColleagueModal from "./delete-colleague";

const ColleagueHeader = ({ user }: any) => {
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const { dispatch } = useContext(DataContext);
  const [deleteColleague, setDeleteColleague] = useState(false);

  const handleOpen = () => {
    setTimeout(() => {
      dispatch({ type: ACTIONS.SHOW_PROFILE, payload: true });
    }, 500);
  };

  //

  return (
    <nav className="flex items-center justify-between p-5 border-b border-[#E6EAEF]">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={handleOpen}
      >
        <div className="relative size-9">
          <Image
            src={
              user?.avatar_url ||
              user?.default_avatar_url ||
              (user?.user_type == "user" || user?.user_type === ""
                ? images?.user
                : images?.bot)
            }
            alt="avatar"
            width={35}
            height={35}
            className="rounded-[6px] size-9 object-cover border drop-shadow-[0px_1.75475px_3.5095px_rgba(16,24,40,0.1)]"
          />
          <div className="absolute -bottom-0.5 -right-1 bg-[#00AD51] w-2 h-2 rounded-full border border-white" />
        </div>

        <h2 className="text-[#1D2939] text-base lg:text-lg font-bold">
          {user?.username}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={menuDropdownRef}>
          <Button
            variant="outline"
            className={`p-2 border-[#E6EAEF] h-9 ${
              isMenuDropdownOpen ? "bg-[#F6F7F9]" : ""
            }`}
            onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
          >
            <EllipsisVertical className="w-5 h-5" color="#344054" />
          </Button>

          <MenuDropdown
            isOpen={isMenuDropdownOpen}
            onClose={() => setIsMenuDropdownOpen(false)}
            deleteModal={() => setDeleteColleague(true)}
          />
        </div>
      </div>

      {deleteColleague && (
        <DeleteColleagueModal
          onCancel={() => setDeleteColleague(false)}
          agent={user}
        />
      )}
    </nav>
  );
};

export default ColleagueHeader;
