import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";
import { Member } from "./type";
import { DataContext } from "~/store/GlobalState";
import { PatchRequest } from "~/utils/new-request";
import { ACTIONS } from "~/store/Actions";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: Member | null;
}

const RestrictMemberModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  selectedMember,
}) => {
  const [buttonLoading, setButtonLoading] = useState(false);

  const { state, dispatch } = useContext(DataContext);
  const { orgId, orgCallback } = state;

  const handleRestrictAccess = async () => {
    setButtonLoading(true);

    const response = await PatchRequest(
      `/organisations/${orgId}/users/${selectedMember?.id}/status`,
      {
        active: selectedMember?.status === "active" ? false : true,
      }
    );

    if (response?.status === 200 || response?.status === 201) {
      dispatch({ type: ACTIONS.ORG_CALLBACK, payload: !orgCallback });
      onClose();
    }

    setButtonLoading(false);
  };

  const isActive = selectedMember?.status === "active";
  const actionText = isActive ? "Restrict" : "Activate";

  //

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-sm bg-black/10">
        <DialogContent className="sm:max-w-2xl bg-white rounded-lg shadow-xl border-0 p-0 overflow-hidden">
          <div className="relative">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {actionText} User Access
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className=" p-1 rounded-md border hover:bg-gray-100"
                >
                  <X size={20} color="#344054" />
                </Button>
              </div>
            </DialogHeader>

            <div>
              <div className="border rounded-lg m-5 p-3 flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold text-[#475467]"
                  >
                    Email Address
                  </label>
                  <div className="border-transparent rounded-none px-0 text-[#101828] !py-0 h-fit">
                    {selectedMember?.email}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475467]">
                    Role
                  </label>
                  <div className="border-transparent rounded-none px-0 text-[#101828] !py-0 h-fit">
                    {selectedMember?.role}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475467]">
                    Date Invited
                  </label>
                  <div className="border-transparent rounded-none px-0 text-[#101828] !py-0 h-fit">
                    {new Date(
                      selectedMember?.created_at || ""
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t mx-5 py-4 mt-4 ">
                <p className="text-sm text-[#667085]">
                  <span className="text-[#475467] font-semibold">Note:</span>The
                  original link sent to this user will lead to an Error 404 page
                  restricting their access to your organisation.
                </p>
              </div>
              <div className="flex justify-end gap-3 px-5 pb-4  ">
                <Button variant="outline" onClick={onClose} className="h-9">
                  Cancel
                </Button>
                <Button
                  className={`${isActive ? "bg-[#F81404]" : "bg-[#7141F8]"} h-9 text-white px-7`}
                  onClick={handleRestrictAccess}
                  disabled={buttonLoading}
                >
                  {buttonLoading
                    ? `${actionText}ing...`
                    : `${actionText} Access`}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export default RestrictMemberModal;
