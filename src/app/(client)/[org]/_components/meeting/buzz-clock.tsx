"use client";

import React, { useState, useEffect } from "react";
import BuzzPopover from "./buzz-popover";

const BuzzClock = () => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Formats to "7:14 PM" - matching Meet's clean style
      const formatted = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setTime(formatted);

      // PERFECT SYNC LOGIC:
      // Calculate how many milliseconds are left until the next minute starts
      const msUntilNextMinute =
        60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

      // Set a one-time timeout to trigger exactly at the start of the next minute
      setTimeout(updateClock, msUntilNextMinute);
    };

    updateClock();
  }, []);

  // Return null if time hasn't initialized to prevent hydration mismatch
  if (!time) return null;

  return (
    <div className="flex items-center gap-2 text-sm font-normal text-white/90 select-none">
      <span className="tabular-nums">{time}</span>
      <span className="text-white/40">|</span>
      <BuzzPopover />
    </div>
  );
};

export default BuzzClock;
