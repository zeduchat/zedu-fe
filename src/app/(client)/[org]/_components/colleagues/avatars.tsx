"use client";

import React from "react";
import { createAvatar } from "@dicebear/core";
import { personas } from "@dicebear/collection";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

const generateAvatars = (count: number): { id: number; svg: string }[] => {
  const avatars = [];
  for (let i = 0; i < count; i++) {
    const avatar = createAvatar(personas, {
      seed: `seed-${i}`,
      size: 90,
    });
    avatars.push({ id: i, svg: avatar.toString() });
  }
  return avatars;
};

const AVATAR_OPTIONS = generateAvatars(150);

interface AvatarPickerProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onAvatarSelect: any;
  selectedAvatar: string;
  loading: boolean;
}

export default function AvatarPicker({
  isDialogOpen,
  setIsDialogOpen,
  onAvatarSelect,
  selectedAvatar,
}: AvatarPickerProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="w-[90px] h-[90px] rounded-lg bg-gradient-to-b from-purple-100 to-purple-50 flex flex-col items-center justify-center cursor-pointer border border-gray-200 hover:border-purple-300 transition-colors overflow-hidden">
          {selectedAvatar ? (
            <>
              {/* nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml */}
              <div
                dangerouslySetInnerHTML={{ __html: selectedAvatar }}
                className="w-full h-full p-1 mr-2"
              />
            </>
          ) : (
            <Plus className="w-6 h-6 text-purple-500" />
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100vw-2rem)] md:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Select a cool avatar from the options below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-4 py-4 mx-auto">
          {AVATAR_OPTIONS.map((avatar) => (
            <div
              key={avatar.id}
              onClick={() => onAvatarSelect(avatar.svg)}
              className={`p-1 rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
            ${
              selectedAvatar === avatar.svg
                ? "border-2 border-purple-600 shadow-md transform scale-105"
                : "border-2 border-gray-200 hover:border-primary-500 hover:shadow-sm"
            }
            overflow-hidden flex items-center justify-center bg-white`}
            >
              {/* nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml */}
              <div
                dangerouslySetInnerHTML={{ __html: avatar.svg }}
                className="size-10 flex items-center justify-center"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
