/* eslint-disable no-unused-vars */
"use client";

import { CheckCircle, Hourglass } from "lucide-react";

import Image from "next/image";
import React from "react";

export interface User {
  id: string;
  email: string;
  username: string;
  profile_url: string;
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
            user.profile_url && user.profile_url.length > 5
              ? user.profile_url
              : "/placeholder.jpeg"
          }
          alt={user.name}
          width={20}
          height={20}
          className="rounded-full"
        />
        <p> {display} </p>
      </div>
      <div>
        {pending && (
          <Hourglass size={14} color="#5F5FE1" className="animate-spin" />
        )}
      </div>
    </div>
  );
};
