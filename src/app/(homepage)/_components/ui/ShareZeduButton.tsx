"use client";

import { Share2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { showError, showSuccess } from "~/components/toast/sonner";

const SHARE_TITLE = "Zedu";
const SHARE_TEXT =
  "Zedu helps educators and learning teams run organized, distraction-free communication for modern cohorts.";

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for browsers or contexts without the async Clipboard API.
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("Copy command failed");
};

export const ShareZeduButton = ({ className }: { className?: string }) => {
  const handleShare = async () => {
    const url = `${window.location.origin}/about`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url });
        return;
      } catch (error) {
        // The visitor closed the share sheet: nothing else to do.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        // Any other share failure falls back to copying the link.
      }
    }

    try {
      await copyToClipboard(url);
      showSuccess("Link copied", "Share it with your friends and team.");
    } catch {
      showError("Couldn't copy the link", url);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors duration-100 hover:border-primary-500 hover:text-primary-500",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        className
      )}
    >
      <Share2 aria-hidden="true" className="size-4" />
      Share Zedu
    </button>
  );
};
