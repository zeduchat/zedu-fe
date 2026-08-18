"use client";

import React from "react";

interface Participant {
  user_id: string;
  username: string;
  avatar_url: string;
}

const ParticipantStack = ({
  participants = [],
}: {
  participants: Participant[];
}) => {
  const count = participants.length;

  if (count === 0) {
    return (
      <p className="text-[#5F6368] text-[15px] text-center">
        No one else is here yet
      </p>
    );
  }

  const MAX_DISPLAY = 3;
  const displayParticipants = participants.slice(0, MAX_DISPLAY);
  const remainingCount = count - MAX_DISPLAY;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 1. The Avatar Stack (Top Layer) */}
      <div className="flex items-center justify-center">
        {displayParticipants.map((person, index) => (
          <div
            key={person.user_id}
            className="relative"
            style={{
              zIndex: MAX_DISPLAY - index,
              marginLeft: index === 0 ? "0px" : "-12px", // Increased overlap for smaller containers
            }}
          >
            <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-[#F1F3F4] shadow-sm">
              {person.avatar_url ? (
                <img
                  src={person.avatar_url}
                  alt={person.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1a73e8] text-white text-[13px] font-medium">
                  {person?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 2. The "+X" Circle */}
        {remainingCount > 0 && (
          <div
            className="w-9 h-9 rounded-full border-2 border-white bg-[#e8eaed] flex items-center justify-center text-[13px] font-medium text-[#3c4043] shadow-sm"
            style={{ zIndex: 0, marginLeft: "-12px" }}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* 3. The Text Label (Bottom Layer) */}
      <p className="text-[#5F6368] text-[14px] font-medium text-center">
        {(() => {
          if (count === 1) return `${participants[0].username} is on the call`;
          if (count === 2)
            return `${participants[0].username} and ${participants[1].username}`;
          if (count === 3) return `${participants[0].username} and 2 others`;
          return `${participants[0].username} and ${count - 1} others`;
        })()}
      </p>
    </div>
  );
};

export default ParticipantStack;
