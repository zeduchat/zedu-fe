"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { DataContext } from "~/store/GlobalState";

interface BuzzTimeoutProps {
  handleLeave?: () => void;
}

const BuzzTimeout = ({ handleLeave }: BuzzTimeoutProps) => {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { state } = useContext(DataContext);
  const { buzzParticipants } = state;

  const participantCount = buzzParticipants.length;

  const handleTerminateMeeting = async () => {
    try {
      if (handleLeave) await handleLeave();
    } catch (err) {
      if (handleLeave) await handleLeave();
    }
  };

  useEffect(() => {
    let graceTimer: NodeJS.Timeout;

    if (participantCount === 1 || participantCount === 0) {
      graceTimer = setTimeout(
        () => {
          setOpen(true);
        },
        5 * 60 * 1000
      );
    } else {
      setOpen(false);
      setTimeLeft(120);
    }

    return () => {
      clearTimeout(graceTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [participantCount]);

  useEffect(() => {
    if (open && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (open && timeLeft === 0) {
      handleTerminateMeeting();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setOpen(false);
      }}
    >
      <DialogContent className="max-w-[440px] p-8 flex flex-col items-center gap-0 border-none">
        <DialogHeader className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F0FE] flex items-center justify-center mb-6">
            <span className="text-[#1a73e8] font-semibold text-lg">
              {formatTime(timeLeft)}
            </span>
          </div>
          <DialogTitle className="text-[#202124] text-[22px] font-normal text-center mb-8">
            Are you still there?
          </DialogTitle>
        </DialogHeader>

        <p className="text-[#5f6368] text-center text-[14px] leading-relaxed mb-6">
          You're the only one here, so this call will end in less than 2
          minutes. Do you want to stay in this call?
        </p>

        <DialogFooter className="w-full flex flex-row justify-end gap-2 sm:justify-end">
          <Button
            variant="ghost"
            onClick={handleTerminateMeeting}
            className="text-[#1a73e8] font-semibold hover:bg-[#F6FAFE] hover:text-[#1a73e8]"
          >
            Leave now
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              setTimeLeft(120);
            }}
            className="text-[#1a73e8] font-semibold hover:bg-[#F6FAFE] hover:text-[#1a73e8]"
          >
            Stay in the call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuzzTimeout;
