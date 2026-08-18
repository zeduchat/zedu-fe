import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { X, AlertCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { PostRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";
import Image from "next/image";
import images from "~/assets/images";
import { useParams } from "next/navigation";
import { showSuccess } from "~/components/toast/sonner";

interface Invitee {
  id: string;
  email: string;
  name?: string;
  profile_url?: string;
}

interface OrgMember {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  profile_url?: string;
}

const ChannelInviteModal = () => {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState<OrgMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useContext(DataContext);
  const { channelInvite, channelDetails, orgMembers = [] } = state;
  const [buttonLoading, setButtonLoading] = useState(false);
  const params = useParams();
  const id = params.id as string;

  const onClose = () => {
    dispatch({ type: ACTIONS.CHANNEL_INVITE, payload: false });
    setInvitees([]);
    setInputValue("");
    setSuggestedUsers([]);
    setError(null);
  };

  useEffect(() => {
    if (channelInvite && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [channelInvite]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);

    if (value.trim() === "") {
      setSuggestedUsers([]);
      return;
    }

    const query = value.toLowerCase();

    const filtered = orgMembers?.filter((user: OrgMember) => {
      const isAlreadyInvited = invitees.some((inv) => inv.email === user.email);
      return (
        !isAlreadyInvited &&
        (user?.name.toLowerCase().includes(query) ||
          user?.email.toLowerCase().includes(query))
      );
    });

    setSuggestedUsers(filtered);
  };

  const addInvitee = (user: OrgMember) => {
    const newInvitee: Invitee = {
      id: user.id,
      email: user.email,
      name: user.name,
      profile_url: user.avatar_url || user.profile_url,
    };

    setInvitees([...invitees, newInvitee]);
    setInputValue("");
    setSuggestedUsers([]);
    textareaRef.current?.focus();
  };

  const removeInvitee = (id: string) => {
    setInvitees(invitees.filter((invitee) => invitee.id !== id));
    textareaRef.current?.focus();
  };

  const handleContainerClick = () => {
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      setError("Please select a user from suggestions");
      return;
    }

    if (invitees.length === 0) {
      setError("Please add at least one user");
      return;
    }

    setButtonLoading(true);

    const payload = {
      // org_id: orgId,
      channel_id: id,
      user_ids: invitees.map((item) => item.id),
    };

    const res = await PostRequest("/channels/add-multiple", payload);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
        payload: !state?.channelCallback,
      });
      showSuccess(res?.data?.message);
      onClose();
    }

    setButtonLoading(false);
  };

  const handleAddEveryone = async () => {
    if (!orgMembers || orgMembers.length === 0) {
      setError("No members to add");
      return;
    }
    setButtonLoading(true);

    const existingInviteeIds = invitees.map((i) => i.id);
    const user_ids = orgMembers
      .map((m: OrgMember) => m.id)
      .filter((uid: string) => !existingInviteeIds.includes(uid));

    if (user_ids.length === 0) {
      setError("All members are already invited");
      setButtonLoading(false);
      return;
    }

    const payload = {
      channel_id: id,
      user_ids,
    };

    const res = await PostRequest("/channels/add-multiple", payload);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
        payload: !state?.channelCallback,
      });
      showSuccess(res?.data?.message || "Added everyone to the channel");
      onClose();
    }

    setButtonLoading(false);
  };

  return (
    <Dialog open={channelInvite} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Add people to #{channelDetails?.name}
          </DialogTitle>

          <div className="flex items-center gap-2">
            <button onClick={onClose}>
              <X size={20} className="text-[#667085] -mt-1.5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>

        <div className="mt-2 relative">
          <label
            htmlFor="invite-input"
            className="text-sm font-semibold text-[#344054] mb-1.5 block"
          >
            Send to
          </label>

          <div
            ref={containerRef}
            className={`flex flex-wrap gap-2 items-center min-h-[40px] border rounded-xl px-3 py-4 cursor-text focus-within:ring-4 focus-within:ring-[#8686F9]/30 ${
              error ? "border-red-500" : "border-[#7141F8]"
            }`}
            onClick={handleContainerClick}
          >
            {invitees.map((invitee) => {
              return (
                <div
                  key={invitee.id}
                  className="flex items-center gap-2 bg-[#F1F1FE] rounded-[3px] px-1 py-[2px]"
                >
                  <Image
                    src={invitee.profile_url || images?.user}
                    alt={invitee.name || invitee.email}
                    width={20}
                    height={20}
                    className="rounded size-5"
                  />

                  <span className="text-xs font-semibold text-[#101828]">
                    {invitee.name ?? invitee.email}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeInvitee(invitee.id);
                    }}
                    className="hover:bg-gray-200 rounded-full p-1"
                  >
                    <X size={14} className="text-[#667085]" />
                  </button>
                </div>
              );
            })}

            <input
              id="invite-input"
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={invitees.length === 0 ? "Enter name or email" : ""}
              className="flex-1 outline-none text-[15px] min-w-[200px] placeholder:text-[#98A2B3] self-center py-1"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            {suggestedUsers.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 border border-gray-300 rounded-md bg-white max-h-[200px] overflow-y-auto shadow-lg z-50">
                {suggestedUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addInvitee(user)}
                  >
                    <div className="size-6 border rounded overflow-hidden">
                      <Image
                        src={
                          user.avatar_url || user.profile_url || images?.user
                        }
                        alt={user.name}
                        width={24}
                        height={24}
                        className="rounded size-6"
                      />
                    </div>

                    <div className="font-medium">{user.name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className="text-sm text-gray-500">
            Search for people in your organisation and add them to #
            {channelDetails?.name}.
          </span>
        </div>

        <div className="flex gap-6 justify-between items-center mt-6">
          <div className="w-full h-[0.5px] bg-[#D6DAE0]" />
          <div className="w-full h-[0.5px] bg-[#D6DAE0]" />
        </div>

        <div className="flex justify-between gap-3 mt-4">
          <Button
            className="h-9 px-7 border bg-gray-100"
            // disabled={invitees.length === 0 || buttonLoading}
            onClick={handleAddEveryone}
          >
            Add everyone
          </Button>

          <Button
            className="bg-[#7141F8] h-9 text-white px-7"
            disabled={invitees.length === 0 || buttonLoading}
            onClick={handleSubmit}
          >
            Add {buttonLoading && <Loading />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelInviteModal;
