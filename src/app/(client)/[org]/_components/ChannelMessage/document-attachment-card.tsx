"use client";

import React, { useContext, useMemo, useState } from "react";
import Image from "next/image";
import {
  Download,
  DownloadIcon,
  ExternalLink,
  File as FileIcon,
  Link2,
  MoreVertical,
  Share2,
  Trash2,
} from "lucide-react";
import { Media } from "~/types/channel";
import { getFileIconClass } from "../file-management/FileList";
import {
  formatBytes,
  getDocumentAccentClass,
  getDocumentCategory,
  getDocumentPreviewUrl,
  getDocumentTypeLabel,
  isValidPreviewSrc,
  normalizeFileExtension,
} from "~/utils/document-files";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import DeleteFileDialog from "../delete-message-modal/delete-file";
import { showInfo } from "~/components/toast/sonner";
import ShareFileModal from "./share-file-modal";

interface DocumentAttachmentCardProps {
  mediaItem: Media;
  item: { message: string; media?: Media[]; type: string };
  onOpenPreview: () => void;
}

const DocumentAttachmentCard: React.FC<DocumentAttachmentCardProps> = ({
  mediaItem,
  item,
  onOpenPreview,
}) => {
  const { dispatch } = useContext(DataContext);
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const category = getDocumentCategory(mediaItem);
  const ext = normalizeFileExtension(mediaItem.file_type, mediaItem.file_name);
  const typeLabel = getDocumentTypeLabel(category, ext);
  const accentClass = getDocumentAccentClass(category);
  const iconSrc = getFileIconClass(mediaItem.file_name);

  const inlinePreviewSrc = useMemo(
    () => getDocumentPreviewUrl(category, mediaItem.file_link),
    [category, mediaItem.file_link]
  );

  const canInlinePreview = isValidPreviewSrc(inlinePreviewSrc);

  const handleDownload = async (event: React.MouseEvent) => {
    event.stopPropagation();
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
    }
  };

  const handleCopyLink = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    navigator.clipboard.writeText(mediaItem.file_link);
    showInfo("Link copied to clipboard");
  };

  const handleDelete = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    dispatch({ type: ACTIONS.THREAD, payload: item });
    setDeleteMessage(true);
  };

  return (
    <>
      <div
        className="group relative w-[240px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          type="button"
          onClick={onOpenPreview}
          className="block w-full text-left"
        >
          <div
            className={`px-3 py-2 text-xs font-semibold text-white ${accentClass}`}
          >
            {typeLabel}
          </div>

          <div className="border-b border-gray-100 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              {iconSrc.startsWith("/") ? (
                <Image src={iconSrc} alt="" width={18} height={18} />
              ) : (
                <FileIcon size={18} className="flex-shrink-0 text-gray-500" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-900">
                  {mediaItem.file_name}
                </p>
                {mediaItem.size ? (
                  <p className="text-[11px] text-gray-500">
                    {formatBytes(mediaItem.size)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative h-[150px] overflow-hidden bg-[#F8F9FA]">
            {canInlinePreview && !previewError ? (
              <iframe
                src={inlinePreviewSrc}
                title={`Preview of ${mediaItem.file_name}`}
                className="pointer-events-none h-[220px] w-[200%] origin-top-left scale-50 border-0 bg-white"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                {iconSrc.startsWith("/") ? (
                  <Image src={iconSrc} alt="" width={48} height={48} />
                ) : (
                  <FileIcon size={48} className="text-gray-300" />
                )}
                <span className="text-[11px] font-medium uppercase text-gray-400">
                  {typeLabel}
                </span>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-700 opacity-0 shadow transition-opacity group-hover:opacity-100">
                Click to preview
              </span>
            </div>
          </div>
        </button>

        {isHovered ? (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg bg-white px-2 py-1 shadow-md">
            <div
              className="rounded-md p-1 hover:bg-gray-200"
              onClick={handleDownload}
            >
              <DownloadIcon size={18} />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent align="end" className="max-width-[300px] p-1">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenPreview();
                    }}
                    className="flex w-full cursor-pointer items-center rounded px-2 py-1.5 text-sm hover:bg-blue-500 hover:text-white"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Preview in app
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex w-full cursor-pointer items-center rounded px-2 py-1.5 text-sm hover:bg-blue-500 hover:text-white"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setShareOpen(true);
                    }}
                    className="flex w-full cursor-pointer items-center rounded px-2 py-1.5 text-sm hover:bg-blue-500 hover:text-white"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Share file...
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex w-full cursor-pointer items-center rounded px-2 py-1.5 text-sm hover:bg-blue-500 hover:text-white"
                  >
                    <Link2 className="mr-2 h-4 w-4" /> Copy link to file
                  </button>
                  <div className="my-1 border-t" />
                  <button
                    onClick={handleDelete}
                    className="flex w-full cursor-pointer items-center rounded px-2 py-1.5 text-sm text-destructive hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete file
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : null}
      </div>

      <ShareFileModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        mediaItem={mediaItem}
        item={item}
      />

      <DeleteFileDialog
        open={deleteMessage}
        setOpen={setDeleteMessage}
        type="file"
        mediaItem={mediaItem}
      />
    </>
  );
};

export default DocumentAttachmentCard;
