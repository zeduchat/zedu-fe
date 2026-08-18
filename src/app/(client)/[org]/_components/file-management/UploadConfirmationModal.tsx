import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { FileIcon } from "lucide-react";

interface UploadConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  files: File[];
}

const UploadConfirmationModal: React.FC<UploadConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  files,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Upload</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              {files.length} file{files.length !== 1 && "s"} selected
            </p>
          </div>

          <div className="max-h-[300px] overflow-y-auto border rounded-md divide-y">
            {files.map((file, index) => {
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="p-3 flex items-center justify-between bg-white"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span
                      className="text-sm truncate max-w-[200px]"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">
                      {formatSize(file.size)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Upload Files</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadConfirmationModal;
