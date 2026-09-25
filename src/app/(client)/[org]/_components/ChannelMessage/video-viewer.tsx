"use client";

import { Maximize2, X } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const VIDEO_VIEWER_Z_INDEX = 99999;

type VideoViewerProps = {
  onClose: () => void;
  item: any;
  video: {
    file_link?: string;
    file_name?: string;
  };
};

const VideoViewer = ({ onClose, item, video }: VideoViewerProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 flex flex-col justify-between p-4"
      style={{ zIndex: VIDEO_VIEWER_Z_INDEX }}
    >
      <div
        className="relative flex justify-between items-start text-white"
        style={{ zIndex: VIDEO_VIEWER_Z_INDEX + 2 }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src={item?.avatar_url || item?.default_avatar_url}
            width={80}
            height={80}
            alt="User avatar"
            unoptimized
            className="h-10 w-10 rounded border object-cover shrink-0"
          />

          <div className="overflow-hidden min-w-0">
            <p className="font-medium truncate">{item?.username}</p>
            <p className="flex flex-wrap text-sm text-gray-300 truncate">
              {moment(item.created_at).startOf("minute").fromNow()} in #
              {item?.channel_name} – {video?.file_name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 sm:top-5 text-white hover:text-gray-300"
          aria-label="Close video"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative flex-grow" />

      <div
        className="flex justify-end items-center text-white/70 text-sm px-1"
        style={{ zIndex: VIDEO_VIEWER_Z_INDEX + 2 }}
      >
        <span className="inline-flex items-center gap-1.5">
          <Maximize2 size={14} />
          Fullscreen player
        </span>
      </div>
    </div>,
    document.body
  );
};

export default VideoViewer;
