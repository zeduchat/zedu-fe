"use client";
import React, { Fragment, useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import { groupMessagesByDate } from "~/utils/group-messages";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "next/image";
import NotificationsDialog from "../notifications-dialog";
import images from "~/assets/images";
import UsePeopleMessage from "../../home/people/hooks/people-message";
import Message from "../ChannelMessage/message";

const FirstPeopleMessage = ({ selectedUsers }: any) => {
  const { fetchMoreData, hasMore } = UsePeopleMessage();
  const { state } = useContext(DataContext);
  const { chats } = state;
  const groupedMessages = groupMessagesByDate(chats);

  //

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
      <InfiniteScroll
        dataLength={chats?.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          chats?.length !== 0 && (
            <h4 className="my-5 text-xs text-center">Loading threads...</h4>
          )
        }
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          overflowY: "scroll",
        }}
        scrollableTarget="scrollableDivs"
        inverse={true}
      >
        {Object.entries(groupedMessages)?.map(([dateLabel, threads]: any) => (
          <Fragment key={dateLabel}>
            {threads?.map((item: any, index: number) => {
              const nextMessage = threads[index + 1];
              const shouldShowAvatar =
                !nextMessage || nextMessage.email !== item.email;

              return (
                <React.Fragment key={index}>
                  <Message item={item} shouldShowAvatar={shouldShowAvatar} />
                </React.Fragment>
              );
            })}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dotted border-[#E6EAEF]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 py-1 text-[13px] text-[#101828] border border-[#E6EAEF] rounded-[30px]">
                  {dateLabel}
                </span>
              </div>
            </div>
          </Fragment>
        ))}
      </InfiniteScroll>

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
