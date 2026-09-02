"use client";
import React from "react";
import Image from "next/image";
import NotificationsDialog from "../notifications-dialog";
import images from "~/assets/images";

const FirstPeopleMessage = ({ selectedUsers }: any) => {
  return (
    <div
      id="scrollableDivs"
      style={{
        height: "100vh",
        overflowY: "scroll",
        display: "flex",
        flexDirection: "column-reverse",
      }}
      className="w-full pb-48"
    >
      {selectedUsers?.length > 0 && (
        <div className="mt-auto px-5 mb-5">
          <div className="flex gap-2 mb-4">
            {selectedUsers?.map((user: any) => (
              <Image
                key={user.id}
                src={user.avatar_url || user.default_avatar_url || images?.user}
                alt={user.name}
                width={56}
                height={56}
                className="rounded-lg size-16 border object-cover"
                unoptimized
              />
            ))}
          </div>

          <p className="text-[17px] text-[#344054] mb-2">
            This is the very beginning of your direct message history with
            {selectedUsers?.map((user: any, index: number) => (
              <React.Fragment key={user.id}>
                <span className="ml-1 py-[1px] px-[3px] bg-[#F1F1FE] text-[#7141F8] dark:bg-[#2D2463] dark:text-[#C4B5FD] text-[15px] rounded-[3px]">
                  {" "}
                  @{user.name}
                </span>
                {index < selectedUsers.length - 2 && ", "}
                {index === selectedUsers.length - 2 && " and"}
              </React.Fragment>
            ))}
          </p>

          <p className=" text-[#344054]">
            You will be notified for{" "}
            <span className="font-bold">every new message</span> in this
            conversation.{" "}
            <NotificationsDialog>
              <button className="text-[#7141F8] hover:underline">
                Change this setting
              </button>
            </NotificationsDialog>
          </p>
        </div>
      )}
    </div>
  );
};

export default FirstPeopleMessage;
