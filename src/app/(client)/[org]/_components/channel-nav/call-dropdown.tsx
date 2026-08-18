import React, { useEffect, useRef } from "react";

import { Button } from "~/components/ui/button";
import Image from "next/image";
import { Phone } from "lucide-react";

const CallDropDown = ({
  isOpen,
  startHuddle,
  onClose,
  isBuzzOngoing,
}: {
  isOpen: boolean;
  startHuddle: () => void;
  onClose: () => void;
  isBuzzOngoing?: boolean;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="flex flex-col border border-[#E0E3E7] bg-white absolute top-full -right-[20%] mt-2.5 w-[175px] rounded-xl shadow-lg z-20"
    >
      <Button
        variant="ghost"
        className="h-[49px] w-full py-6 px-3 flex gap-3 items-center justify-start hover:bg-gray-100"
        onClick={startHuddle}
      >
        <Phone className="size-4 text-[#344054]" />
        <span>{isBuzzOngoing ? "Buzz Ongoing" : "Start A Buzz"}</span>
      </Button>
      <div className="border-b w-full h-1 border-[#E0E3E7]" />
      <Button
        variant="ghost"
        className="h-[49px] w-full py-6 px-3 flex gap-3 items-center justify-start hover:bg-gray-100 hover:rounded-b-xl"
      >
        <Image
          src={"/CopyLink.svg"}
          alt={"copy-link-icon"}
          width={16}
          height={16}
        />
        <span>Copy Buzz Link</span>
      </Button>
    </div>
  );
};

export default CallDropDown;
