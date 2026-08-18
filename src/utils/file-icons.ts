import {
  getDocumentCategory,
  normalizeFileExtension,
} from "~/utils/document-files";

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
  "heic",
  "heif",
  "avif",
  "tiff",
  "tif",
]);

const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "m4v",
  "wmv",
  "flv",
  "mpeg",
  "mpg",
  "3gp",
]);

/** Voice recordings (e.g. chat voice notes) */
const VOICE_RECORDING_EXTENSIONS = new Set(["wav", "m4a"]);

const AUDIO_EXTENSIONS = new Set([
  "mp3",
  "ogg",
  "flac",
  "aac",
  "wma",
  "opus",
  "aiff",
]);

const VOICE_FILE_TYPES = new Set([
  "voice",
  "voice_recording",
  "voice_note",
  "recording",
]);

const VOICE_MIME_TYPES = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
  "audio/x-m4a",
  "audio/m4a",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/mp4",
  "video/webm",
  "video/mpeg",
]);

export const FILE_ICON_PATHS = {
  pdf: "/icons/file-pdf.svg",
  document: "/icons/file-docs.svg",
  spreadsheet: "/icons/file-excel.svg",
  presentation: "/icons/file-ppt.svg",
  image: "/icons/file-image.svg",
  video: "/icons/file-video.svg",
  voice: "/icons/file-voice.svg",
  audio: "/icons/file-audio.svg",
  default: "/icons/file-default.svg",
} as const;

function extensionFromFileName(fileName: string): string {
  const parts = (fileName || "").split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

function resolveExtension(file: {
  file_name?: string;
  mime_type?: string;
  file_type?: string;
}): string {
  const fromHelper = normalizeFileExtension(
    file.file_type || "",
    file.file_name || ""
  );
  if (fromHelper) return fromHelper;
  return extensionFromFileName(file.file_name || "");
}

function isVoiceRecording(
  file: { file_name?: string; file_type?: string },
  mime: string,
  ext: string
): boolean {
  if (VOICE_RECORDING_EXTENSIONS.has(ext)) return true;
  if (VOICE_MIME_TYPES.has(mime)) return true;
  if (mime === "audio/mp4" && ext === "m4a") return true;

  const fileType = (file.file_type || "").toLowerCase().trim();
  if (VOICE_FILE_TYPES.has(fileType)) {
    return (
      mime.startsWith("audio/") ||
      VOICE_RECORDING_EXTENSIONS.has(ext) ||
      ext === "webm"
    );
  }

  return false;
}

function isVideoFile(mime: string, ext: string): boolean {
  if (VIDEO_EXTENSIONS.has(ext)) return true;
  if (mime.startsWith("video/")) return true;
  if (VIDEO_MIME_TYPES.has(mime)) return true;
  return false;
}

export function getFileIconSrc(file: {
  file_name?: string;
  mime_type?: string;
  file_type?: string;
}): string {
  const mime = (file.mime_type || "").toLowerCase().split(";")[0].trim();
  const ext = resolveExtension(file);

  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(ext)) {
    return FILE_ICON_PATHS.image;
  }

  if (isVideoFile(mime, ext)) {
    return FILE_ICON_PATHS.video;
  }

  if (isVoiceRecording(file, mime, ext)) {
    return FILE_ICON_PATHS.voice;
  }

  if (mime.startsWith("audio/") || AUDIO_EXTENSIONS.has(ext)) {
    return FILE_ICON_PATHS.audio;
  }

  const category = getDocumentCategory(file);

  switch (category) {
    case "pdf":
      return FILE_ICON_PATHS.pdf;
    case "document":
      return FILE_ICON_PATHS.document;
    case "spreadsheet":
      return FILE_ICON_PATHS.spreadsheet;
    case "presentation":
      return FILE_ICON_PATHS.presentation;
    default:
      return FILE_ICON_PATHS.default;
  }
}
