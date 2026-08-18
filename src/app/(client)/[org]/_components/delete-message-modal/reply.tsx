"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import images from "~/assets/images";
import MessageItem from "../ChannelMessage/message-item";
import moment from "moment";
import { useParams } from "next/navigation";
import { DeleteRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";

const DeleteReplyMessageDialog = ({ open, setOpen }: any) => {
  const { state } = useContext(DataContext);
  const { threadReply } = state;
  const params = useParams();
  const id = params.id as string;
  const [deleteloading, setDeleteloading] = useState(false);

  const handleDelete = async () => {
    setDeleteloading(true);

    const res = await DeleteRequest(
      `/channels/${id}/messages/${threadReply?.id}`
    );

    if (res?.status === 200 || res?.status === 201) {
      setOpen(false);
    }

    setDeleteloading(false);
  };

  //

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px] rounded-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold">
            Delete message
          </DialogTitle>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 text-sm text-gray-700">
          Are you sure you want to delete this message? This cannot be undone.
        </div>

        <div className="px-6 py-4 max-h-[400px] overflow-auto">
          <div className="border border-gray-200 rounded p-3 flex gap-3 items-start bg-white">
            <div className="w-8 h-8 shrink-0 overflow-hidden bg-green-100 rounded flex items-center justify-center text-white text-sm font-bold">
              <Image
                src={
                  threadReply?.avatar_url ||
                  threadReply?.default_avatar_url ||
                  (threadReply?.user_type == "user" ||
                  threadReply?.user_type === ""
                    ? images?.user
                    : images?.bot)
                }
                alt="avatar"
                width={32}
                height={32}
                className="rounded object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col gap-[2px] text-sm flex-1 min-w-0">
              <div className="flex gap-2 items-baseline">
                <span className="font-bold text-gray-800">
                  {threadReply?.username}
                </span>
                <span className="text-xs text-gray-500">
                  {moment(threadReply?.created_at).calendar()}
                </span>
              </div>
              <MessageItem item={threadReply} />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-4 pt-2">
          <Button
            variant="outline"
            className="rounded-md text-sm px-4 py-2 border border-gray-300"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-rose-600 hover:bg-rose-700 text-white text-sm px-4 py-2 rounded-md shadow-sm"
            onClick={handleDelete}
          >
            Delete {deleteloading && <Loading />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteReplyMessageDialog;
