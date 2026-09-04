import React, { useState, useRef, useEffect } from "react";
import FileActions from "./actions";
import { FileDetails } from "./FileInfo";
import { CheckSquare } from "lucide-react";
import Image from "next/image";
import { getFileIconSrc } from "~/utils/file-icons";

interface FileListProps extends FileDetails {
  onDelete: () => void;
  onRename: () => void;
  onInfo: () => void;
  onShare: () => void;
  onPin: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onMove: () => void;
  onRestore?: () => void;
  viewType: string;
  uploader_display_name?: string;
  // Bulk selection props
  isSelected?: boolean;

  onSelect?: (fileId: string) => void;
  showCheckbox?: boolean;

  onEnterBulkMode?: (fileId: string) => void;
}

export const getFileIconClass = (
  fileName: string | undefined,
  mimeType?: string,
  fileType?: string
): string =>
  getFileIconSrc({
    file_name: fileName,
    mime_type: mimeType,
    file_type: fileType,
  });

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const formatDateCreated = (dateString: string | undefined): string => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const decodeFileName = (fileName: string): string => {
  try {
    return decodeURIComponent(fileName.replace(/\+/g, " "));
  } catch {
    return fileName;
  }
};

/** Shorten long names while keeping the extension and both ends readable. */
export const truncateFileName = (fileName: string, maxLength = 42): string => {
  const decoded = decodeFileName(fileName);
  if (decoded.length <= maxLength) return decoded;

  const dotIndex = decoded.lastIndexOf(".");
  const hasExtension =
    dotIndex > 0 &&
    dotIndex < decoded.length - 1 &&
    decoded.length - dotIndex <= 6;

  const extension = hasExtension ? decoded.slice(dotIndex) : "";
  const baseName = hasExtension ? decoded.slice(0, dotIndex) : decoded;
  const ellipsis = "...";
  const budget = maxLength - extension.length - ellipsis.length;

  if (budget < 8) {
    return `${decoded.slice(0, maxLength - ellipsis.length)}${ellipsis}`;
  }

  const headLength = Math.ceil(budget * 0.55);
  const tailLength = budget - headLength;

  return `${baseName.slice(0, headLength)}${ellipsis}${baseName.slice(-tailLength)}${extension}`;
};

const FileList: React.FC<FileListProps> = ({
  id,
  file_name,
  file_type,
  mime_type,
  size,
  owner,
  created_at,
  onDelete,
  onRename,
  onInfo,
  onShare,
  onPreview,
  onDownload,
  deletedBy,
  onPin,
  pinned,
  onMove,
  viewType,
  onRestore,
  user_profile_photo,
  uploader_display_name,
  isSelected,
  onSelect,
  showCheckbox,
  onEnterBulkMode,
}) => {
  const iconSrc = getFileIconSrc({
    file_name,
    mime_type,
    file_type,
  });
  const displayFileName = truncateFileName(file_name);
  const fullFileName = decodeFileName(file_name);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    if (showCheckbox) return; // Don't show context menu if already in bulk mode
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuOpen(true);
  };

  // Handle long-press for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showCheckbox) return; // Don't handle long-press if already in bulk mode
    longPressTimerRef.current = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenuPosition({ x: touch.clientX, y: touch.clientY });
      setIsContextMenuOpen(true);
    }, 500); // 500ms long-press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleSelectClick = () => {
    onEnterBulkMode?.(id);
    setIsContextMenuOpen(false);
  };

  const handleFileNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview();
  };

  const fileNameClassName =
    "text-[#1F2937] dark:text-zinc-100 min-w-0 flex-1 truncate block hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer";

  const fileIcon = (
    <button
      type="button"
      onClick={handleFileNameClick}
      className="flex-shrink-0 rounded p-0.5 hover:bg-gray-100"
      aria-label={`Preview ${file_name}`}
    >
      <Image
        src={iconSrc}
        width={28}
        height={28}
        alt={file_name || "File Icon"}
        unoptimized
        className="shrink-0"
      />
    </button>
  );

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsContextMenuOpen(false);
    };
    if (isContextMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isContextMenuOpen]);

  if (viewType === "Deleted Files") {
    return (
      <>
        <div
          ref={rowRef}
          key={id}
          className={`flex md:grid md:grid-cols-12 justify-between md:justify-start gap-4 px-3 py-2 md:px-6 md:py-4 hover:bg-blue-50 cursor-pointer transition-colors items-center text-sm overflow-hidden ${
            isSelected ? "bg-blue-100" : ""
          }`}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex-1 md:flex-none md:col-span-6 flex items-center gap-3 min-w-0">
            {showCheckbox && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.(id);
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            )}
            {fileIcon}
            <span
              className={fileNameClassName}
              onClick={handleFileNameClick}
              title={fullFileName}
            >
              {displayFileName}
            </span>
          </div>
          <div className="hidden md:flex md:col-span-2 items-center gap-2 text-[#4B5563] min-w-0">
            <img
              src={user_profile_photo || "/av_Image.png"}
              alt={uploader_display_name || deletedBy || "Unknown"}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="truncate">
              {uploader_display_name || deletedBy || "Unknown"}
            </span>
          </div>
          <div className="hidden md:flex md:col-span-1 items-center text-[#4B5563] truncate">
            {formatFileSize(size)}
          </div>
          <div className="flex-shrink-0 md:col-span-3 flex justify-end">
            <FileActions
              onShare={onShare}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
              onRename={onRename}
              onInfo={onInfo}
              onPin={onPin}
              pinned={pinned}
              onMove={onMove}
              viewType={viewType}
              onRestore={onRestore}
            />
          </div>
        </div>

        {/* Context Menu */}
        {isContextMenuOpen && (
          <div
            className="fixed bg-white border border-gray-200 shadow-lg rounded-lg py-1 z-50"
            style={{
              left: `${contextMenuPosition.x}px`,
              top: `${contextMenuPosition.y}px`,
              minWidth: "160px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#101828] hover:bg-[#F1F1FE] cursor-pointer"
              onClick={handleSelectClick}
            >
              <CheckSquare size={16} />
              <span>Select</span>
            </div>
          </div>
        )}
      </>
    );
  }

  if (viewType === "Shared with me") {
    return (
      <>
        <div
          ref={rowRef}
          key={id}
          className={`flex md:grid md:grid-cols-12 justify-between md:justify-start gap-4 px-3 py-2 md:px-6 md:py-4 hover:bg-blue-50 cursor-pointer transition-colors items-center text-sm overflow-hidden ${
            isSelected ? "bg-blue-100" : ""
          }`}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex-1 md:flex-none md:col-span-6 flex items-center gap-3 min-w-0">
            {showCheckbox && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.(id);
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            )}
            {fileIcon}

            <span
              className={fileNameClassName}
              onClick={handleFileNameClick}
              title={fullFileName}
            >
              {displayFileName}
            </span>
          </div>
          <div className="hidden md:flex md:col-span-2 items-center gap-2 text-[#4B5563] min-w-0">
            {/* <img
              src={user_profile_photo || "/av_Image.png"}
              alt={uploader_display_name || owner}
              className="w-6 h-6 rounded-full object-cover"
            /> */}
            <span className="truncate">{uploader_display_name || owner}</span>
          </div>
          <div className="hidden md:flex md:col-span-2 items-center text-[#4B5563] truncate">
            {formatDateCreated(created_at)}
          </div>
          <div className="hidden md:flex md:col-span-1 items-center text-[#4B5563] truncate">
            {formatFileSize(size)}
          </div>
          <div className="flex-shrink-0 md:col-span-1 flex justify-end">
            <FileActions
              onShare={onShare}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
              onRename={onRename}
              onInfo={onInfo}
              onPin={onPin}
              pinned={pinned}
              onMove={onMove}
              viewType={viewType}
              onRestore={onRestore}
            />
          </div>
        </div>

        {/* Context Menu */}
        {isContextMenuOpen && (
          <div
            className="fixed bg-white border border-gray-200 shadow-lg rounded-lg py-1 z-50"
            style={{
              left: `${contextMenuPosition.x}px`,
              top: `${contextMenuPosition.y}px`,
              minWidth: "160px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#101828] hover:bg-[#F1F1FE] cursor-pointer"
              onClick={handleSelectClick}
            >
              <CheckSquare size={16} />
              <span>Select</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div
        ref={rowRef}
        key={id}
        className={`flex md:grid md:grid-cols-12 justify-between md:justify-start gap-4 px-3 py-2 md:px-6 md:py-4 hover:bg-blue-50 cursor-pointer transition-colors items-center text-sm overflow-hidden ${
          isSelected ? "bg-blue-100" : ""
        }`}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 md:flex-none md:col-span-6 flex items-center gap-3 min-w-0">
          {showCheckbox && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.(id);
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
          )}
          {fileIcon}
          <span
            className={fileNameClassName}
            onClick={handleFileNameClick}
            title={fullFileName}
          >
            {displayFileName}
          </span>
        </div>
        <div className="hidden md:flex md:col-span-2 items-center gap-2 text-[#4B5563] min-w-0">
          {/* <img
            src={user_profile_photo || "/av_Image.png"}
            alt={uploader_display_name || owner}
            className="w-6 h-6 rounded-full object-cover"
          /> */}
          <span className="truncate">{uploader_display_name || owner}</span>
        </div>
        <div className="hidden md:flex md:col-span-2 items-center text-[#4B5563] truncate">
          {formatDateCreated(created_at)}
        </div>
        <div className="hidden md:flex md:col-span-1 items-center text-[#4B5563] truncate">
          {formatFileSize(size)}
        </div>
        <div className="flex-shrink-0 md:col-span-1 flex justify-end">
          <FileActions
            onShare={onShare}
            onDelete={onDelete}
            onRename={onRename}
            onInfo={onInfo}
            onPreview={onPreview}
            onDownload={onDownload}
            onPin={onPin}
            pinned={pinned}
            onMove={onMove}
            viewType={viewType}
            onRestore={onRestore}
          />
        </div>
      </div>

      {/* Context Menu */}
      {isContextMenuOpen && (
        <div
          className="fixed bg-white border border-gray-200 shadow-lg rounded-lg py-1 z-50"
          style={{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
            minWidth: "160px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#101828] hover:bg-[#F1F1FE] cursor-pointer"
            onClick={handleSelectClick}
          >
            <CheckSquare size={16} />
            <span>Select</span>
          </div>
        </div>
      )}
    </>
  );
};
export default FileList;
