"use client";

import { CheckCircle, Hourglass } from "lucide-react";

import Image from "next/image";
import React from "react";

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  default_avatar_url: string;
  name: string;
}

interface UserItemsProps {
  user: User;
  active: boolean;
  onClick?: () => void;
  pending?: boolean;
}

export const UserItem: React.FC<UserItemsProps> = ({
  user,
  active,
  onClick,
  pending,
}) => {
  const display = user.name || user.username || user.email || "User";
  return (
    <div
      onClick={onClick}
      className={`flex ${active ? "" : "hover:bg-gray-100"} items-center justify-between gap-3 p-2 cursor-pointer rounded-lg hover:bg-gray-100`}
    >
      <div className="flex gap-3 items-center">
        <Image
          src={
            user.avatar_url && user.avatar_url.length > 5
              ? user.avatar_url
              : user.default_avatar_url
          }
          alt={user.name}
          width={25}
          height={25}
          className="h-[25px] w-[25px] rounded-full object-top border"
        />
        <p> {display} </p>
      </div>
      <div></div>
    </div>
  );
};
