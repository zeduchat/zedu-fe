"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";
import { useDeleteFile } from "~/hooks/useDeleteFile";

interface DeleteFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (value: boolean) => void;
  fileName: string;
  fileId: string;
  viewType?: string;
}

const DeleteFileModal: React.FC<DeleteFileModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  fileName,
  fileId,
  viewType,
}) => {
  const { deleteFile, isLoading } = useDeleteFile();

  const handleDelete = async () => {
    const isPermanent = viewType === "Deleted Files";
    const success = await deleteFile(fileId, isPermanent);
    onDelete(success);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay>
        <DialogContent className="w-fit px-0">
          <DialogHeader className="">
            <DialogTitle className="px-6 pb-4 tracking-wide border-b-2 border-[#5F5FE1] ">
              Delete file?
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 mt-2 w-full">
            <span className="text-sm text-[#1D2939]">
              This action will delete{" "}
              <span className="font-extrabold">{fileName}</span> of My files
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
                onClick={handleDelete}
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

export default DeleteFileModal;
