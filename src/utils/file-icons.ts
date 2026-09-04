import { getDocumentCategory } from "~/utils/document-files";

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
  "weba",
]);

const MARKDOWN_EXTENSIONS = new Set(["md", "markdown", "mdx"]);

const CODE_EXTENSIONS = new Set([
  "py",
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "html",
  "htm",
  "css",
  "scss",
  "sass",
  "less",
  "java",
  "c",
  "cpp",
  "cc",
  "h",
  "hpp",
  "cs",
  "go",
  "rs",
  "rb",
  "php",
  "swift",
  "kt",
  "kts",
  "sh",
  "bash",
  "zsh",
  "ps1",
  "yml",
  "yaml",
  "toml",
  "xml",
  "sql",
  "r",
  "dart",
  "lua",
  "pl",
  "pm",
  "vue",
  "svelte",
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

const CODE_MIME_TYPES = new Set([
  "text/javascript",
  "application/javascript",
  "text/typescript",
  "application/typescript",
  "application/json",
  "text/html",
  "text/css",
  "text/x-python",
  "application/x-python-code",
  "text/x-java-source",
  "text/x-c",
  "text/x-c++src",
  "application/xml",
  "text/xml",
  "application/x-sh",
  "text/x-shellscript",
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
  code: "/icons/file-code.svg",
  markdown: "/icons/file-markdown.svg",
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
  const fromName = extensionFromFileName(file.file_name || "");
  if (fromName) return fromName;

  const fromType = (file.file_type || "")
    .toLowerCase()
    .replace(/^\./, "")
    .trim();
  if (!fromType || fromType === "file" || fromType.includes("/")) {
    return "";
  }

  return fromType;
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

function isCodeFile(mime: string, ext: string): boolean {
  if (CODE_EXTENSIONS.has(ext)) return true;
  if (CODE_MIME_TYPES.has(mime)) return true;
  return false;
}

function isMarkdownFile(mime: string, ext: string): boolean {
  if (MARKDOWN_EXTENSIONS.has(ext)) return true;
  if (mime === "text/markdown" || mime === "text/x-markdown") return true;
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

  if (isMarkdownFile(mime, ext)) {
    return FILE_ICON_PATHS.markdown;
  }

  if (isCodeFile(mime, ext)) {
    return FILE_ICON_PATHS.code;
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
