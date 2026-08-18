"use client";

import { X } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Media } from "~/types/channel";

type ChannelFileMediaPreviewProps = {
  file: Media & {
    username?: string;
    created_at?: string;
  };
  category: "video" | "audio";
  channelName: string;
  onClose: () => void;
};

export default function ChannelFileMediaPreview({
  file,
  category,
  channelName,
  onClose,
}: ChannelFileMediaPreviewProps) {
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
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col bg-black/95 p-4">
      <div className="flex items-start justify-between text-white">
        <div className="min-w-0 pr-4">
          <p className="truncate font-medium">{file.username || "Member"}</p>
          <p className="truncate text-sm text-gray-300">
            {file.created_at
              ? moment(file.created_at).format("MMM D, YYYY h:mm A")
              : ""}{" "}
            in #{channelName} – {file.file_name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 hover:bg-white/10"
          aria-label="Close preview"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden py-6">
        {category === "video" ? (
          <video
            src={file.file_link}
            controls
            autoPlay
            playsInline
            className="max-h-[85vh] max-w-full rounded-lg"
          />
        ) : (
          <audio
            src={file.file_link}
            controls
            autoPlay
            className="w-full max-w-lg"
          />
        )}
      </div>
    </div>,
    document.body
  );
}
