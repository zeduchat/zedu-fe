"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";
import Loading from "~/components/ui/loading";

interface DeleteWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookName: string;
  onConfirm: () => Promise<boolean>;
  isLoading: boolean;
}

export default function DeleteWebhookModal({
  isOpen,
  onClose,
  webhookName,
  onConfirm,
  isLoading,
}: DeleteWebhookModalProps) {
  const handleDelete = async () => {
    const success = await onConfirm();
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay>
        <DialogContent className="w-fit px-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="px-6 pb-4 tracking-wide border-b-2 border-[#5F5FE1]">
              Delete webhook?
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 mt-2 w-full">
            <span className="text-sm text-[#1D2939]">
              This will permanently remove{" "}
              <span className="font-extrabold">{webhookName}</span>. External
              integrations using this URL will stop working.
            </span>
            <div className="place-self-end mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm bg-transparent border border-[#D0D5DD] text-[#344054] rounded-lg"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-[#D31103] text-white rounded-lg flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    Deleting...
                    <Loading color="white" height="14px" width="14px" />
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
