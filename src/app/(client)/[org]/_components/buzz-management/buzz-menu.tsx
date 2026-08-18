"use client";

import { BuzzPopover, BuzzPopoverMenuSection } from "./buzz-popover";
import { Link2, MoreVertical, Plus, Settings } from "lucide-react";

import { InviteModal } from "./buzzInviteModal";
import { User } from "./buzz-userItems";
import { useState } from "react";

export function BuzzMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [invited, setInvited] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleInvite = (user: User) => {
    setInvited((prev) =>
      prev.some((u) => u.id === user.id) ? prev : [...prev, user]
    );
  };

  const handleRemove = (user: User) => {
    setInvited((prev) => prev.filter((u) => u.id !== user.id));
  };

  const menuSections: BuzzPopoverMenuSection[] = [
    {
      items: [
        {
          id: "invite people",
          label: "Invite People",
          icon: <Plus size={20} className="text-[#1E1E1E]" />,
          onClick: () => {
            setModalOpen(true);
            setIsOpen(false);
          },
        },
      ],
      divider: true,
    },
    {
      items: [
        {
          id: "Copy buzz link",
          label: "Copy buzz link",
          icon: <Link2 size={20} className="text-[#1E1E1E] -rotate-45" />,
          onClick: () => {
            setIsOpen(false);
          },
        },
      ],
      divider: true,
    },
  ];

  return (
    <>
      <BuzzPopover
        sections={menuSections}
        open={isOpen}
        onOpenChange={setIsOpen}
        align="end"
        side="bottom"
      >
        <button className="p-2" aria-label="More options">
          <MoreVertical size={16} className="text-[#475467]" />
        </button>
      </BuzzPopover>

      <InviteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onInvite={handleInvite}
        onRemove={handleRemove}
      />
    </>
  );
}
