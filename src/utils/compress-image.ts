import imageCompression from "browser-image-compression";

const SKIP_UNDER_BYTES = 150 * 1024; // 150KB
const MAX_SIZE_MB = 0.3; // ~300KB
const MAX_WIDTH_OR_HEIGHT = 1600;

const isCompressibleImage = (file: File): boolean => {
  if (!file.type.startsWith("image/")) return false;
  // Preserve animated GIFs
  if (file.type === "image/gif") return false;
  if (file.size <= SKIP_UNDER_BYTES) return false;
  return true;
};

export async function compressImage(file: File): Promise<File> {
  if (!isCompressibleImage(file)) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
      fileType: file.type,
    });

    if (!compressed || compressed.size >= file.size) {
      return file;
    }

    return new File([compressed], file.name, {
      type: compressed.type || file.type,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
