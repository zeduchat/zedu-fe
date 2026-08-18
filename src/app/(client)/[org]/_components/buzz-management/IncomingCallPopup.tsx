import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PhoneCall } from "lucide-react";
import Loading from "~/components/ui/loading";

interface IncomingCallPopupProps {
  avatarUrl: string;
  inviterName: string;
  channelName: string;
  onAccept: () => void;
  onDecline: () => void;
  timeoutSeconds?: number;
  onTimeout?: () => void;
  loading?: boolean;
}

const IncomingCallPopup: React.FC<IncomingCallPopupProps> = ({
  avatarUrl,
  inviterName,
  channelName,
  onAccept,
  onDecline,
  timeoutSeconds = 30,
  onTimeout,
  loading = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(timeoutSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio playback for ringtone
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Start timer
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    // Play ringtone when popup mounts
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Stop ringtone when popup unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      onTimeout && onTimeout();
    }
  }, [secondsLeft, onTimeout]);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="max-w-[400px] w-full sm:w-[380px] bg-gradient-to-br from-[#303073] to-[#252554] rounded-2xl shadow-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
        {/* Animated background accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse" />

        <div className="px-4 py-5 sm:px-6 sm:py-6 flex flex-col items-center gap-4">
          {/* Avatar with ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-pulse blur-md opacity-50" />
            <div className="relative w-16 h-16 rounded-full ring-4 ring-white/20 overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`${inviterName}'s avatar`}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {inviterName ? inviterName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <p className="text-white text-base sm:text-lg font-semibold">
              {inviterName} is calling
            </p>
            <p className="text-white/70 text-xs sm:text-sm font-medium">
              Join the buzz
            </p>
            <p className="text-white/60 text-xs mt-1">
              Auto-declining in {secondsLeft}s
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 w-full mt-2">
            <button
              onClick={onAccept}
              className="group flex items-center justify-center gap-2.5 w-full bg-white hover:bg-gray-50 active:scale-95 transition-all duration-200 rounded-xl py-3 px-4 shadow-lg hover:shadow-xl"
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                {loading ? (
                  <Loading />
                ) : (
                  <PhoneCall size={18} className="text-white" />
                )}
              </div>
              <span className="text-gray-900 font-semibold text-base">
                Join Buzz
              </span>
            </button>

            <button
              onClick={onDecline}
              className="w-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all duration-200 backdrop-blur-sm rounded-xl py-3 px-4 text-white font-medium text-base"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
      {/* Ringtone audio is now handled locally in this popup */}
      <audio
        ref={audioRef}
        src="/audio/call-ringtone.mp3"
        preload="auto"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default IncomingCallPopup;
