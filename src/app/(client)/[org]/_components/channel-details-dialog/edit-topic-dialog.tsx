import React, { useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { DataContext } from "~/store/GlobalState";
import { PatchRequest } from "~/utils/new-request";
import { useParams } from "next/navigation";
import { ACTIONS } from "~/store/Actions";
import Loading from "~/components/ui/loading";
import { showSuccess } from "~/components/toast/sonner";

interface EditTopicDialogProps {
  children: React.ReactNode;
  className?: string;
  type?: string;
}

export const EditTopicDialog: React.FC<EditTopicDialogProps> = ({
  children,
  className,
  type,
}) => {
  const { state, dispatch } = useContext(DataContext);
  const { channelDetails } = state;
  const [buttonLoading, setButtonLoading] = useState(false);
  const [desc, setDesc] = useState("");
  const [topic, setTopic] = useState("");
  const params = useParams();
  const id = params?.id as string;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (type === "topic") {
      setTopic(channelDetails?.topic);
    } else {
      setDesc(channelDetails?.description);
    }
  }, [type]);

  const handleEdit = async () => {
    setButtonLoading(true);
    let payload;

    if (type === "topic") {
      payload = {
        topic: topic,
      };
    } else {
      payload = {
        description: desc,
      };
    }

    const res = await PatchRequest(`/channels/${id}`, payload);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
        payload: !state?.channelCallback,
      });
      showSuccess(res?.data?.message);
      setButtonLoading(false);
    } else {
      setButtonLoading(false);
    }
    setOpen(false);
  };

  //

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className="p-0 gap-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="font-black text-[1.375rem] text-[#1D2939] capitalize">
            Edit {type}
          </DialogTitle>
        </DialogHeader>

        <DialogClose className="absolute right-5 top-4 text-[#344054] p-1 border border-input rounded-[0.3125rem]">
          <X className="size-5 text-[#344054]" />
        </DialogClose>

        <div className="w-full p-5 space-y-3 flex flex-col">
          {type === "topic" ? (
            <textarea
              placeholder="Add a topic"
              className="bg-[#F9FAFB] w-full min-h-[10rem] p-2.5 rounded-[0.375rem] border border-input outline-none focus-within:border-[#6868F7] focus-within:ring focus-within:ring-[#D0D0FD] "
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          ) : (
            <textarea
              placeholder="Add a description"
              className="bg-[#F9FAFB] w-full min-h-[10rem] p-2.5 rounded-[0.375rem] border border-input outline-none focus-within:border-[#6868F7] focus-within:ring focus-within:ring-[#D0D0FD] "
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          )}

          <DialogDescription className="text-[0.8125rem] text-[#667085]">
            Let people know what{" "}
            <span className="font-bold text-[#475467]">
              #{state?.channelDetails?.name}
            </span>{" "}
            is focused on right now (ex. a project milestone). Topics are always
            visible in the header
          </DialogDescription>

          <div className="ml-auto space-x-4 ">
            <DialogClose>
              <Button
                variant={"outline"}
                className="min-w-20 h-fit py-2.5 rounded-[0.3125rem]"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={buttonLoading || (topic === "" && desc === "")}
              className="min-w-20 h-fit py-2.5 bg-primary-500 text-white rounded-[0.3125rem] disabled:opacity-50"
              onClick={handleEdit}
            >
              Save {buttonLoading && <Loading />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
