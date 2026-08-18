"use client";

import React from "react";
import BuzzClock from "./buzz-clock";
import BuzzPeopleHover from "./buzz-people-hover";
import RecordingIndicator from "./recording-indicator";

interface BuzzTopBarProps {
  onViewAllPeople: () => void;
  readOnlyUi?: boolean;
}

const BuzzTopBar = ({
  onViewAllPeople,
  readOnlyUi = false,
}: BuzzTopBarProps) => {
  return (
    <header className="shrink-0 z-50 flex items-center justify-between gap-4 border-b border-zinc-800/80 bg-[#202124] px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <BuzzClock />
        <RecordingIndicator readOnlyUi={readOnlyUi} />
      </div>
      <BuzzPeopleHover onViewAll={onViewAllPeople} readOnlyUi={readOnlyUi} />
    </header>
  );
};

export default BuzzTopBar;
