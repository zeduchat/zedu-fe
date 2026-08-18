"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";
import { useDeleteFolder } from "../../../../../hooks/useDeleteFolder";

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  folderId: string;
  onDeleteSuccess: () => void;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  isOpen,
  onClose,
  folderName,
  folderId,
  onDeleteSuccess,
}) => {
  const { deleteFolder, isLoading } = useDeleteFolder();

  const handleDelete = async () => {
    const success = await deleteFolder(folderId);
    if (success) {
      onDeleteSuccess();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay>
        <DialogContent className="w-fit px-0">
          <DialogHeader className="">
            <DialogTitle className="px-6 pb-4 tracking-wide border-b-2 border-[#5F5FE1] ">
              Delete folder?
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 mt-2 w-full">
            <span className="flex w-full mr-10 text-sm text-[#1D2939]">
              This action will permanently delete the folder
              <p className="mx-0.5 font-extrabold">{folderName}</p>
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

export default DeleteFolderModal;
