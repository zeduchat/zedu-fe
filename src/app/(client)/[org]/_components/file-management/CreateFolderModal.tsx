"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onCreate: (folderName: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState("");

  const handleCreate = () => {
    if (folderName.trim() !== "") {
      onCreate(folderName);
      setFolderName("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-center justify-between -m-6 px-6 py-4 border-b border-[#7141f8]">
          <DialogTitle className=" font-semibold">
            Create New Folder
          </DialogTitle>
          <DialogClose asChild>
            <button className="p-1 rounded-sm border border-[#7141f8] hover:bg-gray-100">
              <X size={24} />
            </button>
          </DialogClose>
        </DialogHeader>
        <div className=" mt-5 py-5 px-3">
          <label htmlFor="folderName" className="block text-sm  mb-2">
            Folder name
          </label>
          <Input
            id="folderName"
            placeholder="Untitled folder"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="border-2 focus:border-[#7141f8]"
          />
        </div>
        <DialogFooter className="">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleCreate}
            className="bg-[#7141f8] text-white hover:bg-[#7141f8]/90"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
