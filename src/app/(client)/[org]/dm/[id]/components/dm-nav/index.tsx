"use client";
import { EllipsisVertical } from "lucide-react";
import React, { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import MenuDropdown from "./menu-dropdown";
import { ActionsIcon } from "~/svgs";
import Image from "next/image";

interface User {
  id: string;
  fullName: string;
  displayName: string;
  avatar: string;
}

const DmHeader = ({ user }: { user: User }) => {
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  return (
    <nav className="flex items-center justify-between p-5 border-b border-[#E6EAEF]">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image
            src={user.avatar}
            alt={user.fullName}
            width={28}
            height={28}
            className="rounded-[6px] border-2 border-[#5F5FE1]"
          />
          <div className="absolute -bottom-0.5 -right-1 bg-[#00AD51] w-2 h-2 rounded-full border border-white" />
        </div>
        <h2 className="text-[#1D2939] text-lg font-bold">Jennifer Garner</h2>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-[90px] h-9 flex justify-center items-center py-[7px] pr-2.5 pl-3 gap-1 rounded-[5px] border-[1px] border-[#E6EAEF] bg-white box-border hover:bg-[#F6F7F9] focus:bg-[#F6F7F9] duration-300 ml-auto">
          <p className="font-semibold text-[#344054] text-[13px]">Actions</p>
          <ActionsIcon />
        </button>

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
          />
        </div>
      </div>
    </nav>
  );
};

export default DmHeader;
