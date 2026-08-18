"use client";
import React from "react";
import CreateChannelDialog from "../chat-nav/create-channel-dialog";

const AllChannelHeader = () => {
  //

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-[#E6EAEF]">
      <h2 className="text-[#1D2939] text-base lg:text-lg font-bold">
        Channels
      </h2>

      <CreateChannelDialog />
    </nav>
  );
};

export default AllChannelHeader;
