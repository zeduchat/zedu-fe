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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Member } from "./type";
import { DataContext } from "~/store/GlobalState";
import { PatchRequest } from "~/utils/new-request";
import { ACTIONS } from "~/store/Actions";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: Member | null;
  onMemberRoleUpdated?: (memberId: string, roleName: string) => void;
}

const EditMemberRoleModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  selectedMember,
  onMemberRoleUpdated,
}) => {
  const { state, dispatch } = useContext(DataContext);
  const { orgRoles, orgMembers } = state;
  const email = (selectedMember && selectedMember.email) || "";
  const currentRole = (selectedMember && selectedMember.role) || "";
  const dateInvited = (selectedMember && selectedMember.created_at) || "";
  const [buttonLoading, setButtonLoading] = useState(false);

  const currentRoleId =
    orgRoles?.find((role: any) => role.name === currentRole)?.id || currentRole;

  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId);
  const selectedRole =
    orgRoles?.find((role: any) => role.id === selectedRoleId)?.name || "";

  const updateRole = async () => {
    setButtonLoading(true);

    const response = await PatchRequest(
      `/organisations/${state.orgId}/users/${selectedMember?.id}/role`,
      {
        role_id: selectedRoleId,
      }
    );

    if (response?.status === 200 || response?.status === 201) {
      const roleName =
        response?.data?.data?.role ??
        response?.data?.data?.role_name ??
        selectedRole;

      if (selectedMember?.id) {
        onMemberRoleUpdated?.(selectedMember.id, roleName);
      }

      const currentMembers = orgMembers || [];
      const updatedMembers = currentMembers.map((member: any) => {
        const memberId = member.id ?? member.user_id;
        if (memberId === selectedMember?.id) {
          return { ...member, role: roleName };
        }
        return member;
      });
      dispatch({ type: ACTIONS.ORG_MEMBERS, payload: updatedMembers });
      onClose();
    }

    setButtonLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-sm bg-black/10">
        <DialogContent className="sm:max-w-2xl bg-white rounded-lg shadow-xl border-0 p-0 overflow-hidden">
          <div className="relative">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Member Role
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
                    {email}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475467]">
                    Role
                  </label>
                  <div className="border-transparent rounded-none px-0 text-[#101828] !py-0 h-fit">
                    {currentRole}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475467]">
                    Date Invited
                  </label>
                  <div className="border-transparent rounded-none px-0 text-[#101828] !py-0 h-fit">
                    {new Date(dateInvited).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="px-5">
                <label className="text-xs font-semibold text-[#475467]">
                  Role
                </label>
                <Select
                  disabled={currentRole === "bot"}
                  defaultValue={currentRoleId}
                  onValueChange={(value) => setSelectedRoleId(value)}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgRoles?.map((role: any) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t mx-5 py-4 mt-4 ">
                <p className="text-sm text-[#667085]">
                  <span className="text-[#475467] font-semibold">Note:</span>{" "}
                  This will take effect once the user joins the organisation.
                </p>
              </div>
              <div className="flex justify-end gap-3 px-5 pb-4  ">
                <Button variant="outline" onClick={onClose} className="h-9">
                  Cancel
                </Button>
                <Button
                  className="bg-[#7141F8] h-9 text-white px-7"
                  onClick={updateRole}
                  disabled={buttonLoading}
                >
                  {buttonLoading ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export default EditMemberRoleModal;
