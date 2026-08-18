"use client";

import { useEffect, useRef } from "react";
import type { ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

interface VideoPlayerProps {
  videoTrack: ILocalVideoTrack | IRemoteVideoTrack | null;
  className?: string;
}

export function VideoPlayer({ videoTrack, className = "" }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoTrack || !containerRef.current) return;
    videoTrack.play(containerRef.current);

    return () => {
      videoTrack.stop();
    };
  }, [videoTrack]);

  if (!videoTrack) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 ${className}`}
      >
        <p className="text-white">No video feed active</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-gray-900 ${className}`}
    />
  );
}
