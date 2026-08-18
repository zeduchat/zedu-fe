"use client";
import { ArrowLeft, EllipsisVertical } from "lucide-react";
import React, { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import DeleteColleagueModal from "./delete-colleague";
import DetailDropdown from "./detail-dropdown";
import { useRouter } from "next/navigation";

const DetailsHeader = ({ user }: any) => {
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const [deleteColleague, setDeleteColleague] = useState(false);
  const router = useRouter();

  //

  return (
    <nav className="flex items-center justify-between p-5 border-b border-[#E6EAEF]">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => router.back()}
      >
        <ArrowLeft size={20} />
        <h2 className="text-[#1D2939] text-base lg:text-lg font-bold">
          AI Coworker Profile
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

          <DetailDropdown
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

export default DetailsHeader;
