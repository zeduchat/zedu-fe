"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";

interface NotificationsDialogProps {
  children: React.ReactNode;
}

const NotificationsDialog = ({ children }: NotificationsDialogProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[563px] p-0">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2 text-[#101828] border-b border-[#E6EAEF] py-5 px-6">
            <span className="text-[22px] font-black text-[#1D2939]">
              Notifications
            </span>
            <div
              className="cursor-pointer p-[5px] rounded-[5px] border border-[#E6EAEF]"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" color="#344054" />
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="pb-5 pt-2 px-6">
          <h3 className="text-[#101828] font-bold text-[15px] mb-3">
            Send a notification for:
          </h3>
          <RadioGroup defaultValue="all" className="flex flex-col gap-3 pb-5">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="all" id="all" />
              <div className="flex-1">
                <div className="font-medium text-[15px] text-[#0A0A0A]">
                  All new messages
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="mentions" id="mentions" />
              <div className="flex-1">
                <div className="font-medium text-[15px] text-[#0A0A0A]">
                  Mentions
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="nothing" id="nothing" />
              <div className="flex-1">
                <div className="font-medium text-[15px] text-[#0A0A0A]">
                  Nothing
                </div>
              </div>
            </div>
          </RadioGroup>
          <hr className="border-[#E6EAEF]" />
          <div className="flex items-start gap-3 py-4">
            <Checkbox id="mobile" className="rounded-sm w-5 h-5" />
            <label htmlFor="mobile" className="text-[15px] text-[#0A0A0A]">
              Use different settings for mobile devices
            </label>
          </div>
          <hr className="border-[#E6EAEF]" />
          <div className="flex items-start gap-3 py-4">
            <Checkbox id="thread-replies" className="rounded-sm w-5 h-5" />
            <label
              htmlFor="thread-replies"
              className="text-[15px] text-[#0A0A0A]"
            >
              Get notified about all thread replies in this conversation
            </label>
          </div>
          <hr className="border-[#E6EAEF]" />
          <div className="flex items-start gap-3 py-4">
            <Checkbox id="mute" className="rounded-sm w-5 h-5" />
            <div>
              <label
                htmlFor="mute"
                className="block text-[15px] text-[#0A0A0A] mb-1"
              >
                Mute group chat
              </label>
              <p className="text-[15px] text-[#667085]">
                Muted group chats are greyed out at the bottom of your chat
                list. You will still see a badge in the sidebar if you&apos;ve
                been mentioned.
              </p>
            </div>
          </div>
          <hr className="border-[#E6EAEF]" />

          <p className="mt-5 text-[13px] text-[#667085]">
            <span className="font-semibold text-[#475467]">Note:</span> You can
            set notification keywords and change your workspace-wide settings in
            your <span className="text-[#7141F8]">Preferences.</span>
          </p>

          {/* button group */}
          <div className="items-center gap-3 mt-5 flex justify-end">
            <Button variant="outline" className="">
              Cancel
            </Button>
            <Button className="text-white bg-[#7141F8]">Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
