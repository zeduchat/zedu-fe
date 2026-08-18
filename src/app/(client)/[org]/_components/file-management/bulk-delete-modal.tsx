"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileCount: number;
  isLoading: boolean;
  viewType: string;
}

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileCount,
  isLoading,
  viewType,
}) => {
  const isPermanent = viewType === "Deleted Files";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay>
        <DialogContent className="w-fit px-0">
          <DialogHeader className="">
            <DialogTitle className="px-6 pb-4 tracking-wide border-b-2 border-[#5F5FE1] ">
              Delete {fileCount} file{fileCount > 1 ? "s" : ""}?
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 mt-2 w-full">
            <span className="text-sm text-[#1D2939]">
              {isPermanent ? (
                <>
                  This action will{" "}
                  <span className="font-extrabold">permanently delete</span>{" "}
                  <span className="font-extrabold">{fileCount}</span> file
                  {fileCount > 1 ? "s" : ""}. This cannot be undone.
                </>
              ) : (
                <>
                  This action will delete{" "}
                  <span className="font-extrabold">{fileCount}</span> file
                  {fileCount > 1 ? "s" : ""}. You can restore them from the
                  Deleted Files section.
                </>
              )}
            </span>
            <div className="place-self-end mt-5 ">
              <button
                className="px-4 py-2 text-sm bg-transparent border border-[#D0D5DD] text-[#344054] rounded-lg mr-2"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm bg-[#D31103] text-white rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export default BulkDeleteModal;
