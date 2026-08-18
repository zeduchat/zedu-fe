"use client";

import React, { useContext, useState } from "react";
import {
  X,
  Search,
  MicOff,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import { Participant } from "~/hooks/buzz";
import { filterVisibleParticipants } from "~/lib/buzz/session";
import { AudioWaveBars } from "../buzz-management/audio-wave-border";
import { useAudioVisualizer } from "~/hooks/useAudioVisualizer";

interface ParticipantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ParticipantSidebar = ({ isOpen, onClose }: ParticipantSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isContributorsExpanded, setIsContributorsExpanded] = useState(true);
  const { state } = useContext(DataContext);
  const { buzzParticipants = [], user } = state;
  const { isSpeaking, volume } = useAudioVisualizer({
    audioTrack: null,
    threshold: 0.1,
  });

  if (!isOpen) return null;

  const visibleParticipants =
    filterVisibleParticipants<Participant>(buzzParticipants);
  const filteredParticipants = visibleParticipants.filter((p) =>
    p.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full border border-zinc-700 rounded-xl flex flex-col overflow-hidden ml-4">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-white text-[18px] font-normal">People</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-700 rounded-full transition-colors text-zinc-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-6 mb-4">
        <div className="relative group border border-zinc-800">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-400 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search for people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#202124] border border-zinc-700 rounded-md py-2.5 pl-11 pr-4 text-zinc-200 text-sm focus:outline-none transition-all placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-2">
          In the meeting
        </p>

        <div className="border border-zinc-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsContributorsExpanded(!isContributorsExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#1e1e1e] hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 text-sm font-medium">
                Contributors
              </span>
              <span className="text-zinc-500 text-xs">
                {buzzParticipants.length}
              </span>
            </div>
            {isContributorsExpanded ? (
              <ChevronUp size={18} className="text-zinc-400" />
            ) : (
              <ChevronDown size={18} className="text-zinc-400" />
            )}
          </button>

          {isContributorsExpanded && (
            <div className="bg-[#1e1e1e]">
              {filteredParticipants.map((participant, idx) => {
                const isLocalUser = user?.user_id === participant.user_id;
                return (
                  <ParticipantRow
                    key={participant.user_id || idx}
                    name={
                      isLocalUser
                        ? `${participant.username} (You)`
                        : participant.username
                    }
                    isMuted={!participant.audioTrack}
                    isSpeaking={isSpeaking}
                    volume={volume}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ParticipantRow = ({
  name,
  isMuted,
  isSpeaking,
  volume,
}: {
  name: string | undefined;
  isMuted: boolean;
  isSpeaking: boolean;
  volume: number;
}) => (
  <div className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/40 transition-colors group">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#546e7a] flex items-center justify-center text-white text-xs font-medium">
        {name?.charAt(0).toUpperCase()}
      </div>
      <span className="text-zinc-300 text-sm truncate max-w-[160px]">
        {name}
      </span>
    </div>

    <div className="flex items-center gap-1">
      {isMuted ? (
        <div className="p-1.5 text-zinc-400">
          <MicOff size={16} />
        </div>
      ) : (
        <AudioWaveBars isSpeaking={isSpeaking} volume={volume} />
      )}
      <button className="p-1.5 text-zinc-400 hover:bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical size={16} />
      </button>
    </div>
  </div>
);

export default ParticipantSidebar;
