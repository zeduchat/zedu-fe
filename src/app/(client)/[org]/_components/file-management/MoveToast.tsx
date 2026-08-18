"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface MoveToastProps {
  isVisible: boolean;
  fileName: string;
  folderName: string;
  onUndo: () => void;
  onClose: () => void;
  isUndoMessage?: boolean;
}

const MoveToast: React.FC<MoveToastProps> = ({
  isVisible,
  fileName,
  folderName,
  onUndo,
  onClose,
  isUndoMessage = false,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 ${isUndoMessage ? "left-1/2" : "left-1/2"}  transform -translate-x-1/2 z-50 animate-slide-up`}
    >
      <div
        className={`bg-[#1C1C1C] text-white rounded-lg shadow-2xl flex items-center gap-4 ${
          isUndoMessage ? "px-4 py-2 min-w-[200px]" : "px-6 py-2 min-w-[400px]"
        }`}
      >
        <div className="flex-1">
          {isUndoMessage ? (
            <p className="text-sm font-medium">Action undone</p>
          ) : (
            <p className="text-sm font-medium">
              <span className="font-semibold">{fileName}</span> moved to{" "}
              <span className="font-semibold">{folderName}</span>
            </p>
          )}
        </div>
        {!isUndoMessage && (
          <Button
            onClick={() => {
              onUndo();
            }}
            variant="ghost"
            className="text-white hover:text-white hover:bg-white/20 px-4 py-2 h-auto text-sm font-medium"
          >
            Undo
          </Button>
        )}
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default MoveToast;
