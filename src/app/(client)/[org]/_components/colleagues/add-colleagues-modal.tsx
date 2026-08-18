"use client";

import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { PlusCircle, X } from "lucide-react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import AvatarPicker from "./avatars";
import { PostRequest, UploadRequest } from "~/utils/new-request";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { showError, showSuccess } from "~/components/toast/sonner";

const initialState = {
  name: "",
  tone: "",
  title: "",
  description: "",
  visibility: "",
};

export default function AddColleagueDialog() {
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [values, setValues] = useState(initialState);
  const [avatarSvg, setAvatarSvg] = useState("");
  const { state, dispatch } = useContext(DataContext);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleToneChange = (value: string) => {
    setValues({ ...values, tone: value });
  };

  const handleRadioChange = (value: string) => {
    setValues({ ...values, visibility: value });
  };

  const handleAvatarSelect = async (svg: string) => {
    setIsDialogOpen(false);
    setUploading(true);

    // Create a new Image object from the SVG string
    const image = new Image();
    const svgBlob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    image.src = url;

    image.onload = async () => {
      // Create a canvas element and draw the SVG onto it
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(image, 0, 0);

        // Get the PNG data as a Blob
        canvas.toBlob(async (pngBlob) => {
          if (pngBlob) {
            const formData = new FormData();
            formData.append("files", pngBlob, "avatar.png");

            try {
              const res = await UploadRequest(`/files/upload-files`, formData);
              if (res?.data?.data && res.data.data.length > 0) {
                const imageUrl = res.data.data[0];
                setAvatarUrl(imageUrl.file_link);
                setAvatarSvg(svg);
                // showSuccess("Avatar uploaded successfully!");
              }
            } catch (error) {
              console.error("Upload failed", error);
              showError("Failed to upload avatar");
            } finally {
              setUploading(false);
            }
          }
        }, "image/png");
      }
    };

    image.onerror = () => {
      setUploading(false);
      showError("Failed to load SVG for conversion.");
    };
  };

  const handleSubmit = async () => {
    setButtonLoading(true);
    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      name: values.name,
      tone: values.tone,
      avatar: avatarUrl,
      title: values.title,
      description: values.description,
      visibility: values.visibility,
    };

    try {
      const res = await PostRequest(`/organisations/${orgId}/agents`, payload);
      if (res.status === 200 || res.status === 201) {
        dispatch({
          type: ACTIONS.AGENT_CALLBACK,
          payload: !state?.agentCallback,
        });
        showSuccess(res.data.message);
        setOpen(false);
        setValues(initialState);
        setAvatarSvg("");
      }
    } catch (error) {
      console.error("Creation failed", error);
      showError("Failed to create colleague");
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "relative px-2 pl-3 mx-2 mb-3 flex items-center gap-2 rounded-lg group cursor-pointer"
          )}
        >
          <PlusCircle size={18} className="" color="white" />
          <p className={cn("text-[14px] leading-4 truncate text-blue-50")}>
            Add New
          </p>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-xl px-0 py-6">
        <DialogHeader className="!flex !flex-row items-center justify-between px-6">
          <DialogTitle className="text-xl font-semibold">
            Create a New AI Colleague
          </DialogTitle>
          <DialogClose asChild>
            <button className="p-1 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[480px] px-6 pt-4 border-t">
          <div className="flex items-center gap-4 mt-4">
            <AvatarPicker
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              onAvatarSelect={handleAvatarSelect}
              selectedAvatar={avatarSvg}
              loading={uploading}
            />

            <div className="flex flex-col justify-start">
              <Label className="text-sm text-gray-700">Tone</Label>
              <Select value={values.tone} onValueChange={handleToneChange}>
                <SelectTrigger className="w-40 mt-1 focus-ring-1 focus:ring-primary-500 focus-visible:ring-0 focus-visible:ring-primary">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => setIsDialogOpen(true)}
                className="text-xs text-start text-purple-500 mt-2"
              >
                ↻ Regenerate Face
              </button>
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm text-gray-700">Colleague name</Label>
              <Input
                placeholder="e.g Juno"
                className="mt-1"
                maxLength={40}
                value={values.name}
                name="name"
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className="text-sm text-gray-700">Colleague Title</Label>
              <Input
                placeholder="e.g Telegram Summariser"
                className="mt-1"
                maxLength={80}
                value={values.title}
                name="title"
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className="text-sm text-gray-700">Job description</Label>
              <Textarea
                placeholder={`e.g Monitor the #sales Telegram group and email me when "discount" is mentioned.`}
                className="mt-1 resize-none"
                maxLength={80}
                value={values.description}
                name="description"
                onChange={handleChange}
              />
              <div className="text-xs text-gray-500 mt-1">
                {values.description.length}/80
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Label className="block mb-2 text-sm font-medium text-gray-700">
              Colleague Visibility
            </Label>
            <RadioGroup
              value={values.visibility}
              onValueChange={handleRadioChange}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex flex-col">
                  <span className="text-sm font-medium">
                    Public - anyone in {state?.orgDetails?.name}
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex flex-col">
                  <span className="text-sm font-medium">
                    Private - only specific people{" "}
                    <span className="text-gray-500 text-xs">
                      (can only be viewed or used by Admins)
                    </span>
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="me" id="me" />
                <Label htmlFor="me" className="flex flex-col">
                  <span className="text-sm font-medium">Me only</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            <strong>Note:</strong> AI colleagues are personalized, chat-based
            agents that perform Tasks just like human teammates within Zedu.
          </p>
        </div>

        <DialogFooter className="pt-6 flex justify-end gap-3 px-6 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              !values.description ||
              !values.name ||
              !values.title ||
              !values.tone ||
              !values.visibility ||
              !avatarSvg ||
              buttonLoading
            }
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={handleSubmit}
          >
            {buttonLoading ? "Creating..." : "Create Colleague"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
