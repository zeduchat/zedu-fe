"use client";
import React, { useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import MessageBox from "./message-box";
import { X } from "lucide-react";
import ReplyMessage from "./reply-message";
import ReplyConnection from "~/components/layout/centrifugo/reply-connection";

const ThreadsSidebar = ({ handleSendMessage, fetchMoreData, hasMore }: any) => {
  const { state, dispatch } = useContext(DataContext);

  const onClose = () => {
    dispatch({ type: ACTIONS.REPLY, payload: false });
    dispatch({ type: ACTIONS.IS_EDIT_REPLY, payload: false });
    dispatch({ type: ACTIONS.LOAD_THREAD, payload: !state.loadThread });
  };

  //

  return (
    <div className="relative h-[calc(100vh-80px)] w-full overflow-y-auto">
      <ReplyConnection />
      <div className="relative flex items-center justify-between min-h-[70px] px-5 border-b font-bold textbase lg:text-lg">
        Thread
        <button
          onClick={onClose}
          className="text-[#344054] p-1 border border-input rounded-[0.3125rem]"
        >
          <X className="size-5 text-[#344054]" />
        </button>
      </div>

      <ReplyMessage fetchMoreData={fetchMoreData} hasMore={hasMore} />

      <MessageBox
        subscription={state?.replySubscription}
        sendMessage={handleSendMessage}
        show={false}
      />
    </div>
  );
};

export default ThreadsSidebar;
