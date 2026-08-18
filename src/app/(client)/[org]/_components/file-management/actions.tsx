"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Eye,
  Pin,
  Share,
  Move,
  FileEdit,
  Info,
  Trash2,
  MoreVertical,
  PinOff,
  Undo2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
interface FileActionsProps {
  onDelete: () => void;
  onRename: () => void;
  onInfo: () => void;
  onShare: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onPin: () => void;
  pinned?: boolean;
  onMove: () => void;
  viewType?: string;
  onRestore?: () => void;
}
const FileActions: React.FC<FileActionsProps> = ({
  onDelete,
  onRename,
  onInfo,
  onShare,
  onPreview,
  onDownload,
  onPin,
  pinned,
  onMove,
  viewType,
  onRestore,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Different actions for Deleted Files view
  const deletedFilesActions = [
    { label: "Restore", icon: <Undo2 size={16} />, onClick: onRestore },
    {
      label: "Delete permanently",
      icon: <Trash2 size={16} />,
      onClick: onDelete,
    },
  ];

  // Default actions for other views
  const defaultActions = [
    { label: "Download", icon: <Download size={16} />, onClick: onDownload },
    { label: "Preview", icon: <Eye size={16} />, onClick: onPreview },
    {
      label: pinned ? "Unpin" : "Pin",
      icon: pinned ? <PinOff size={16} /> : <Pin size={16} />,
      onClick: onPin,
    },
    { label: "Share", icon: <Share size={16} />, onClick: onShare },
    { label: "Move", icon: <Move size={16} />, onClick: onMove },
    { label: "Rename", icon: <FileEdit size={16} />, onClick: onRename },
    { label: "Info", icon: <Info size={16} />, onClick: onInfo },
    { label: "Delete", icon: <Trash2 size={16} />, onClick: onDelete },
  ];

  const actions =
    viewType === "Deleted Files" ? deletedFilesActions : defaultActions;
  useEffect(() => {
    const body = document.body;
    if (isPopoverOpen) {
      body.classList.add("overflow-hidden");
    } else {
      body.classList.remove("overflow-hidden");
    }
    return () => {
      body.classList.remove("overflow-hidden");
    };
  }, [isPopoverOpen]);
  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="py-[7px] px-[10px] hover:bg-gray-200 rounded"
            aria-label="More options"
          >
            <MoreVertical size={18} className="text-[#667085]" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 bg-white border border-gray-200 shadow-lg"
          style={{
            width: "216px",
            height: viewType === "Deleted Files" ? "auto" : "306px",
            borderRadius: "7px",
          }}
          align="end"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="popover-content"
          >
            {actions.map((action) => (
              <div
                key={action.label}
                className={`group flex items-center justify-between px-4 py-2 text-sm text-[#101828] hover:bg-[#F1F1FE] cursor-pointer ${action.label === "Delete" || action.label === "Delete permanently" ? "text-red-500" : ""}`}
                onClick={() => {
                  action.onClick?.();
                  setIsPopoverOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  {action.icon}
                  <span>{action.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </PopoverContent>
      </Popover>
      {isPopoverOpen && (
        <div
          className="fixed inset-0 bg-black/1 z-40"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
export default FileActions;
