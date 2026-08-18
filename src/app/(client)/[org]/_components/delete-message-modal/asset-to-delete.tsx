import React, { useMemo, useState } from "react";
import Image from "next/image";
import { File as FileIcon } from "lucide-react";
import { getFileIconClass } from "../file-management/FileList";
import {
  getDocumentCategory,
  getDocumentAccentClass,
  getDocumentTypeLabel,
  getOfficeEmbedUrl,
  getPdfEmbedUrl,
  isPreviewableDocument,
  normalizeFileExtension,
  usesOfficeEmbed,
} from "~/utils/document-files";

interface MediaItem {
  id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_link: string;
}

type MediaCategory = "image" | "video" | "audio" | "document" | "file";

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
]);
const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "ogv",
  "m4v",
]);
const AUDIO_EXTENSIONS = new Set([
  "wav",
  "m4a",
  "mp3",
  "ogg",
  "aac",
  "flac",
  "opus",
  "weba",
]);

const getMediaCategory = (mediaItem: MediaItem): MediaCategory => {
  const mime = (mediaItem.mime_type || "").toLowerCase().split(";")[0].trim();
  const ext = normalizeFileExtension(mediaItem.file_type, mediaItem.file_name);

  if (mime.startsWith("audio/") || AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (mime.startsWith("video/") || VIDEO_EXTENSIONS.has(ext)) return "video";
  if (mime === "application/octet-stream" && VIDEO_EXTENSIONS.has(ext)) {
    return "video";
  }
  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(ext)) return "image";
  if (isPreviewableDocument(getDocumentCategory(mediaItem))) return "document";

  return "file";
};

interface AssetToDeleteProps {
  mediaItem: MediaItem;
}

const AssetToDelete: React.FC<AssetToDeleteProps> = ({ mediaItem }) => {
  const category = getMediaCategory(mediaItem);

  switch (category) {
    case "image":
      return <ImagePreview mediaItem={mediaItem} />;
    case "video":
      return <VideoPreview mediaItem={mediaItem} />;
    case "audio":
      return <AudioPreview mediaItem={mediaItem} />;
    case "document":
      return <DocumentPreview mediaItem={mediaItem} />;
    default:
      return <FilePreview mediaItem={mediaItem} />;
  }
};

const ImagePreview: React.FC<{ mediaItem: MediaItem }> = ({ mediaItem }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return <FilePreview mediaItem={mediaItem} />;
  }

  return (
    <div className="mt-2 relative w-full max-w-[350px] overflow-hidden rounded-md">
      <img
        src={mediaItem.file_link}
        alt={mediaItem.file_name}
        className="w-full max-h-[300px] rounded-md border object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

const VideoPreview: React.FC<{ mediaItem: MediaItem }> = ({ mediaItem }) => (
  <div className="mt-2 w-full max-w-[400px] overflow-hidden rounded-md bg-black/5">
    <video
      src={mediaItem.file_link}
      controls
      playsInline
      className="w-full max-h-[300px] rounded-md border object-contain bg-black"
    />
  </div>
);

const AudioPreview: React.FC<{ mediaItem: MediaItem }> = ({ mediaItem }) => (
  <div className="mt-2 w-full max-w-[400px] rounded-lg border bg-gray-50 p-3">
    <p className="mb-2 truncate text-xs font-medium text-gray-700">
      {mediaItem.file_name}
    </p>
    <audio src={mediaItem.file_link} controls className="w-full" />
  </div>
);

const DocumentPreview: React.FC<{ mediaItem: MediaItem }> = ({ mediaItem }) => {
  const [previewError, setPreviewError] = useState(false);
  const category = getDocumentCategory(mediaItem);
  const ext = normalizeFileExtension(mediaItem.file_type, mediaItem.file_name);
  const typeLabel = getDocumentTypeLabel(category, ext);
  const accentClass = getDocumentAccentClass(category);
  const iconSrc = getFileIconClass(mediaItem.file_name);

  const inlinePreviewSrc = useMemo(() => {
    if (category === "pdf") return getPdfEmbedUrl(mediaItem.file_link);
    if (usesOfficeEmbed(category))
      return getOfficeEmbedUrl(mediaItem.file_link);
    return null;
  }, [category, mediaItem.file_link]);

  return (
    <div className="mt-2 w-full max-w-[350px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div
        className={`px-3 py-2 text-xs font-semibold text-white ${accentClass}`}
      >
        {typeLabel}
      </div>
      <div className="border-b border-gray-100 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {iconSrc.startsWith("/") ? (
            <Image src={iconSrc} alt="" width={18} height={18} />
          ) : (
            <FileIcon size={18} className="shrink-0 text-gray-500" />
          )}
          <p className="truncate text-xs font-medium text-gray-900">
            {mediaItem.file_name}
          </p>
        </div>
      </div>
      <div className="relative h-[200px] overflow-hidden bg-[#F8F9FA]">
        {inlinePreviewSrc && !previewError ? (
          <iframe
            src={inlinePreviewSrc}
            title={`Preview of ${mediaItem.file_name}`}
            className="pointer-events-none h-[280px] w-[200%] origin-top-left scale-50 border-0 bg-white"
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
      </div>
    </div>
  );
};

const FilePreview: React.FC<{ mediaItem: MediaItem }> = ({ mediaItem }) => {
  const iconSrc = getFileIconClass(mediaItem.file_name);
  const ext = normalizeFileExtension(mediaItem.file_type, mediaItem.file_name);

  return (
    <a
      href={mediaItem.file_link}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block w-full max-w-[240px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex min-w-0 items-center gap-2 border-b bg-gray-50 p-3">
        {iconSrc.startsWith("/") ? (
          <Image src={iconSrc} alt="" width={20} height={20} />
        ) : (
          <FileIcon size={20} className="shrink-0 text-gray-500" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-gray-900">
            {mediaItem.file_name}
          </p>
          {ext ? (
            <p className="text-[11px] uppercase text-gray-500">{ext}</p>
          ) : null}
        </div>
      </div>
      <div className="flex h-[120px] items-center justify-center">
        {iconSrc.startsWith("/") ? (
          <Image src={iconSrc} alt="" width={48} height={48} />
        ) : (
          <FileIcon size={48} className="text-gray-300" />
        )}
      </div>
    </a>
  );
};

export default AssetToDelete;
