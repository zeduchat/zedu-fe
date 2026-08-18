import React, { useContext, useState } from "react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { PutRequest } from "~/utils/new-request";
import { useParams } from "next/navigation";
import Loading from "~/components/ui/loading";

interface EditTopicDialogProps {
  children: React.ReactNode;
  className?: string;
}

export const UnarchiveChannelDialog: React.FC<EditTopicDialogProps> = ({
  children,
  className,
}) => {
  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const handleArchive = async () => {
    const payload = {
      archived: state?.channelDetails?.archived === true ? false : true,
    };

    setArchiveLoading(true);
    const res = await PutRequest(`/channels/${id}/archive`, payload);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
        payload: !state?.channelCallback,
      });
      // get the first channel and route the user there
      // const channel = state?.ungroupedChannels[0]
      // localStorage.setItem("channelId", channel?.channels_id)
      // router.push(`/client/home/channels/${channel?.channels_id}`);
    }

    setArchiveLoading(false);
  };
  //

  return (
    <Dialog>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className="p-0 gap-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="font-black text-[1.375rem] text-[#1D2939]">
            Archive this channel?
          </DialogTitle>
        </DialogHeader>

        <DialogClose className="absolute right-5 top-4 text-[#344054] p-1 border border-input rounded-[0.3125rem]">
          <X className="size-5 text-[#344054]" />
        </DialogClose>

        <DialogDescription className="text-sm text-[#344054] space-y-3 p-5">
          <p>
            When you archive a channel, it’s archived for everyone. That
            means...
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>No one will be able to send messages to the channel</li>
            <li>Any apps installed in the channel will be disabled</li>
            <li>
              If there are external people in this channel, they will be
              removed. They’ll still have access to the chat history.
            </li>
          </ul>
          <p>
            You’ll still be able to find the channel’s contents via search. And
            you can always unarchive the channel in the future, if you’d like.
          </p>
        </DialogDescription>

        <DialogFooter className="flex justify-end space-x-2 p-5">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button onClick={handleArchive} variant="destructive">
            Archive Channel {archiveLoading && <Loading />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
