"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  Share2,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import { Media } from "~/types/channel";
import {
  formatBytes,
  getDocumentAccentClass,
  getDocumentCategory,
  getDocumentTypeLabel,
  getOfficeEmbedUrl,
  getPdfEmbedUrl,
  normalizeFileExtension,
} from "~/utils/document-files";
import ShareFileModal from "./share-file-modal";

interface DocumentPreviewModalProps {
  mediaItem: Media;
  item: { message: string; media?: Media[]; type: string };
  onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  mediaItem,
  item,
  onClose,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  const category = getDocumentCategory(mediaItem);
  const ext = normalizeFileExtension(mediaItem.file_type, mediaItem.file_name);
  const typeLabel = getDocumentTypeLabel(category, ext);
  const accentClass = getDocumentAccentClass(category);

  const previewSrc = useMemo(() => {
    if (category === "pdf") {
      return getPdfEmbedUrl(mediaItem.file_link);
    }
    return getOfficeEmbedUrl(mediaItem.file_link);
  }, [category, mediaItem.file_link]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [mediaItem.id]);

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaItem.file_link);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = mediaItem.file_name;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(mediaItem.file_link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative flex h-[92vh] w-[94vw] max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`rounded px-2 py-1 text-xs font-semibold text-white ${accentClass}`}
              >
                {typeLabel}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-gray-900">
                  {mediaItem.file_name}
                </h3>
                {mediaItem.size ? (
                  <p className="text-xs text-gray-500">
                    {formatBytes(mediaItem.size)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-[#7141F8] px-3 py-2 text-sm font-medium text-white hover:bg-[#5F2FE6]"
              >
                <Download size={16} />
                Download
              </button>
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Share2 size={16} />
                Share
              </button>
              <a
                href={mediaItem.file_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink size={16} />
                Open
              </a>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100"
                aria-label="Close preview"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden bg-[#F4F5F7]">
            {isLoading && !hasError ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F4F5F7]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : null}

            {hasError ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <FileText size={48} className="mb-4 text-gray-300" />
                <p className="mb-2 font-medium text-gray-900">
                  Preview unavailable
                </p>
                <p className="mb-4 text-sm text-gray-500">
                  This file cannot be previewed in-app. You can download it or
                  open it in your browser.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="rounded-lg bg-[#7141F8] px-4 py-2 text-sm text-white"
                  >
                    Download file
                  </button>
                  <a
                    href={mediaItem.file_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
                  >
                    Open in browser
                  </a>
                </div>
              </div>
            ) : (
              <iframe
                src={previewSrc}
                title={mediaItem.file_name}
                className="h-full w-full border-0 bg-white"
                onLoad={() => setIsLoading(false)}
              />
            )}
          </div>

          <div className="border-t border-gray-200 px-6 py-2 text-center text-xs text-gray-500">
            Press{" "}
            <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-0.5 font-mono">
              ESC
            </kbd>{" "}
            to close
          </div>
        </div>
      </div>

      <ShareFileModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        mediaItem={mediaItem}
        item={item}
      />
    </>
  );
};

export default DocumentPreviewModal;
