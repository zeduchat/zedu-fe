import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface InviteCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: () => void;
}

const InviteCallModal: React.FC<InviteCallModalProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const handleInvite = () => {
    onInvite();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay>
          <DialogContent className="w-fit px-0">
            <DialogHeader className="flex  justify-between border-b border-[#E6EAEF] px-6 pb-4">
              <DialogTitle className="tracking-wide">Start a buzz</DialogTitle>
              <DialogDescription>
                Find people, channels, rooms...
              </DialogDescription>
            </DialogHeader>

            <div className="px-4">
              <p>Add</p>
              <div className="w-[499px] border border-[#E6EAEF] rounded mb-4 h-14"></div>
              <Tabs defaultValue="rename">
                <TabsList>
                  <TabsTrigger
                    className=" active:border-b active:border-[#7141F8]"
                    value="rename"
                  >
                    Invited
                  </TabsTrigger>
                  <TabsTrigger value="delete">Shared</TabsTrigger>
                </TabsList>
                <TabsContent value="rename">
                  <div className="px-6 py-4">
                    <ul>
                      <li>Shareef Huds</li>
                      <li>Shareef Huds</li>
                      <li>Shareef Huds</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="delete">
                  <div className="px-6 py-4">
                    <ul>
                      <li>Shareef Huds</li>
                      <li>Shareef Huds</li>
                      <li>Shareef Huds</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="place-self-end mt-5 ">
                <button
                  className="px-4 py-2 text-sm bg-transparent border border-[#D0D5DD] text-[#344054] rounded-lg mr-2"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  className="disabled:opacity-50 px-4 py-2 text-sm bg-[#7141F8] text-white rounded-lg"
                >
                  Start
                </button>
              </div>
            </div>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </>
  );
};

export default InviteCallModal;
