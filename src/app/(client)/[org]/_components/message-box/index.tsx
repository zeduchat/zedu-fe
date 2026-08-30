"use client";

import {
  AtSign,
  Bold,
  Code,
  SquareCode,
  FileIcon,
  Hash,
  Italic,
  Upload,
  Link2,
  List,
  ListOrdered,
  Mic,
  SendHorizonal,
  Slash,
  Smile,
  Strikethrough,
  Video,
  XIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { ACTIONS } from "~/store/Actions";
import { Button } from "~/components/ui/button";
import { DataContext } from "~/store/GlobalState";
import { EditorContent } from "@tiptap/react";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import Loading from "~/components/ui/loading";
import Picker from "~/components/theme/themed-emoji-picker";
import Tooltips from "../tooltip";
import { UploadRequest } from "~/utils/new-request";
import UseTextEditor from "../editor";
import { VoiceRecorder } from "../voice/voice-recorder";
import { VoiceThumbnails } from "../voice/voice-thumbnails";
import data from "@emoji-mart/data";
import emojione from "emojione";
import { emoticonMap } from "./emoticon-map";
import { useParams } from "next/navigation";
import { uuidv7 } from "uuidv7";
import { CHAT_FILE_ACCEPT } from "~/utils/document-files";

interface VoiceMessage {
  id: string;
  type: "voice";
  content: string;
  audioUrl: string;
  duration: number;
  timestamp: string;
}

const MessageBox = ({ subscription, sendMessage, show = true }: any) => {
  const { state, dispatch } = useContext(DataContext);
  const params = useParams();
  const id = params.id as string;
  const uuid = uuidv7();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showFormatting, setShowformatting] = useState(true);
  const [media, setMedia] = useState<any>([]);
  const [medias, setMedias] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceThumbnails, setVoiceThumbnails] = useState<VoiceMessage[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Create a real FileList to mimic an <input type="file">
    const dt = new DataTransfer();
    Array.from(files).forEach((file) => dt.items.add(file));

    handleFileChange({
      target: {
        files: dt.files, // full FileList with all types
      },
    } as any);
  };

  useEffect(() => {
    return () => {
      media.forEach((image: any) => URL.revokeObjectURL(image.preview));
    };
  }, [media]);

  const handleImagePaste = (file: File) => {
    const fileWithId = {
      id: Date.now() + Math.random(),
      file,
      type: "image",
      preview: URL.createObjectURL(file),
    };

    setMedia((prev: any) => [...prev, fileWithId]);
    setUploadingImages((prev) => [...prev, fileWithId.id]);

    const formData = new FormData();
    formData.append("files", file);

    UploadRequest(`/files/upload-files`, formData)
      .then((res) => {
        const imageUrl = res?.data?.data[0];

        if (imageUrl && editor) {
          setMedias((prev) => [...prev, imageUrl]);
        }
      })
      .catch((error) => {
        console.error("Image paste upload failed", error);
      })
      .finally(() => {
        setUploadingImages((prev) => prev.filter((id) => id !== fileWithId.id));
      });
  };

  const { editor, isEmpty } = UseTextEditor(subscription, handleImagePaste);

  const handleSave = () => {
    if (!text || !url) return;

    editor
      ?.chain()
      .focus()
      .insertContent(
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
      )
      .run();

    setOpen(false);
    setText("");
    setUrl("");
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newMedia = Array.from(files).map((file) => {
      const fileType = file.type.split("/")[0];

      return {
        id: Date.now() + Math.random(),
        file,
        type: fileType,
        preview:
          fileType === "image" || fileType === "video"
            ? URL.createObjectURL(file)
            : null,
      };
    });

    setMedia((prevMedia: any) => [...prevMedia, ...newMedia]);

    for (const media of newMedia) {
      setUploadingImages((prev) => [...prev, media.id]);

      const formData = new FormData();
      formData.append("files", media.file);

      try {
        const res = await UploadRequest(`/files/upload-files`, formData);
        if (res?.data?.data) {
          setMedias((prevMedias) => [...prevMedias, ...res.data.data]);
        }
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setUploadingImages((prev) => prev.filter((id) => id !== media.id));
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setMedia((prevImages: any) =>
      prevImages.filter((_: any) => _ !== prevImages[index])
    );
    setMedias((prevMedias) => prevMedias.filter((_, i) => i !== index));
  };

  const replaceEmoticonsWithEmojis = (text: string) => {
    let convertedText = text;
    for (const emoticon in emoticonMap) {
      const escapedEmoticon = emoticon.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedEmoticon, "g");
      convertedText = convertedText.replace(regex, emoticonMap[emoticon]);
    }
    return convertedText;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editor) return;

    // Get full HTML content from editor (keeps links, mentions, etc.)
    let content = editor.getHTML();

    // Extract plain text to check if there's any content (ignore tags)
    const plainTextContent = editor.getText().trim();
    const hasTextContent = plainTextContent.length > 0;
    const hasMediaContent = medias.length > 0;

    if (!hasTextContent && !hasMediaContent) return;

    // Convert emoticons in the plain text, but apply them inside the HTML
    const textWithEmoticonsConverted =
      replaceEmoticonsWithEmojis(plainTextContent);
    const fullyConvertedText = emojione.shortnameToUnicode(
      textWithEmoticonsConverted
    );

    content = content.replace(plainTextContent, fullyConvertedText);

    if (subscription) {
      editor.commands.clearContent();
      setMedia([]);
      setMedias([]);
      setVoiceThumbnails([]);

      sendMessage(id, uuid, content, medias);
      dispatch({ type: ACTIONS.CLEAR_MENTIONS });
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      if (editor?.isActive("codeBlock")) {
        return;
      }

      if (event.shiftKey) {
        return;
      } else if (
        editor?.isActive("bulletList") ||
        editor?.isActive("orderedList")
      ) {
        event.preventDefault();
        editor?.chain().focus().splitListItem("listItem").run();
      } else {
        event.preventDefault();
        handleSubmit(event);
      }
    }
  };

  const onEmojiClick = (emojiData: any) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiData?.native).run();
      setIsEmojiPickerOpen(false);
    }
  };

  const handleMentionClick = () => {
    editor?.chain().focus().insertContent("@").run();
  };

  const handleChannelMentionClick = () => {
    editor?.chain().focus().insertContent("#").run();
  };

  const handleSlashCommandClick = () => {
    editor?.chain().focus().insertContent("/").run();
  };

  useEffect(() => {
    if (editor) {
      editor.commands.focus();
    }
  }, [editor]);

  const handleSendVoice = (audioBlob: Blob, duration: number) => {
    const audioUrl = URL.createObjectURL(audioBlob);

    // 1. Create a unique ID for state tracking
    const mediaId = Date.now() + Math.random();

    // 2. Wrap the Blob in a File object for FormData
    const audioFile = new File([audioBlob], `voice_message_${mediaId}.wav`, {
      type: audioBlob.type || "audio/wav",
    });

    const newMedia = {
      id: mediaId,
      file: audioFile,
      type: "audio",
      preview: audioUrl,
    };

    // Update local state to show the thumbnail/preview
    setVoiceThumbnails((prev: any) => [
      ...prev,
      {
        ...newMedia,
        content: "",
        audioUrl,
        duration,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setIsRecording(false);

    const uploadVoice = async () => {
      setUploadingImages((prev) => [...prev, newMedia.id]);

      const formData = new FormData();
      formData.append("files", newMedia.file);

      try {
        const res = await UploadRequest(`/files/upload-files`, formData);
        if (res?.data?.data) {
          setMedias((prevMedias) => [...prevMedias, ...res.data.data]);
        }
      } catch (error) {
        console.error("Voice upload failed", error);
      } finally {
        setUploadingImages((prev) => prev.filter((id) => id !== newMedia.id));
      }
    };

    uploadVoice();
  };

  const handleRemoveVoice = (index: number) => {
    setVoiceThumbnails((prev: any) =>
      prev.filter((_: any) => _ !== prev[index])
    );
    setMedias((prevMedias) => prevMedias.filter((_, i) => i !== index));
  };

  return (
    <>
      {isRecording && (
        <VoiceRecorder
          onSend={handleSendVoice}
          onCancel={() => setIsRecording(false)}
        />
      )}

      <div
        onClick={() => editor && editor.commands.focus()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`bg-white border rounded-xl mx-3 md:mx-5 border-[#E6EAEF] overflow-hidden ${state?.reply ? "right-[520px]" : "right-0"} ${editor?.isFocused ? "border-primary-400" : "border-gray-200"}`}
      >
        {showFormatting && (
          <div className="border-b border-[#E6EAEF] flex items-center gap-2 bg-[#F9FAFB] pl-3 pr-4 py-[5px]">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("bold")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <Bold
                size={18}
                color={editor?.isActive("bold") ? "#444444" : "#CACACA"}
              />
            </button>

            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("italic")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <Italic
                size={18}
                color={editor?.isActive("italic") ? "#444444" : "#CACACA"}
              />
            </button>

            <button
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("strike")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <Strikethrough
                size={18}
                color={editor?.isActive("strike") ? "#444444" : "#CACACA"}
              />
            </button>

            <div className="w-px h-5 bg-[#E6EAEF]" />

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={() => setOpen(true)}
                  className={`p-1.5 hover:bg-gray-100 rounded ${editor?.isActive("link") ? "bg-gray-200 font-semibold text-black" : ""}`}
                >
                  <Link2
                    size={18}
                    color={editor?.isActive("link") ? "#444444" : "#CACACA"}
                  />
                </button>
              </DialogTrigger>

              <DialogContent className="w-full max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-semibold">Add link</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Text</label>
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter link text"
                  />

                  <label className="text-sm font-medium mt-2">Link</label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL"
                    type="url"
                  />
                </div>

                <DialogFooter className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!text || !url}
                    className="bg-blue-500 text-white px-10"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("orderedList")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <ListOrdered
                size={18}
                color={editor?.isActive("orderedList") ? "#444444" : "#CACACA"}
              />
            </button>

            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("bulletList")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <List
                size={18}
                color={editor?.isActive("bulletList") ? "#444444" : "#CACACA"}
              />
            </button>

            <div className="w-px h-5 bg-[#E6EAEF]" />

            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleCode().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("code")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
              title="Inline code"
            >
              <Code
                size={18}
                color={editor?.isActive("code") ? "#444444" : "#CACACA"}
              />
            </button>

            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("codeBlock")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
              title="Code block"
            >
              <SquareCode
                size={18}
                color={editor?.isActive("codeBlock") ? "#444444" : "#CACACA"}
              />
            </button>
          </div>
        )}

        <div className="md:flex-1 relative px-3">
          <EditorContent
            editor={editor}
            className="py-2 rounded-md flex flex-row overflow-auto"
            onKeyDown={handleKeyDown}
          />

          <div className={`flex gap-3 ${media?.length > 0 ? "mt-3" : ""}`}>
            {media?.map((file: any, index: number) => (
              <div key={index} className="relative w-[70px] h-[70px]">
                {/* IMAGE PREVIEW */}
                {file.type === "image" && (
                  <Image
                    src={file.preview}
                    alt={`Uploaded ${index}`}
                    width={70}
                    height={70}
                    className="w-[70px] h-[70px] rounded-md object-cover border border-primary-400 cursor-pointer"
                  />
                )}

                {/* VIDEO PREVIEW */}
                {file.type === "video" && (
                  <video
                    src={file.preview}
                    className="w-[70px] h-[70px] rounded-md border border-primary-400 object-cover"
                    controls
                  />
                )}

                {/* DOCUMENT / OTHER FILES */}

                {(file.type.startsWith("application") ||
                  file.type.startsWith("text")) && (
                  <div className="w-[70px] h-[70px] flex flex-col items-center justify-center border border-primary-500 rounded-md bg-gray-100 p-1 text-center">
                    <a
                      href={URL.createObjectURL(file.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center"
                    >
                      <FileIcon size={24} color="#606060" />
                      <span className="text-xs text-blue-500 mt-1">
                        {file.file.name.split(".").pop()?.toUpperCase()}
                      </span>
                    </a>
                  </div>
                )}

                {/* REMOVE BUTTON */}
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-1 -right-2 p-1 bg-gray-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  <XIcon size={14} />
                </button>

                {/* UPLOADING INDICATOR */}
                {uploadingImages.includes(file?.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                    <Loading />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            className={`flex gap-3 ${voiceThumbnails?.length > 0 ? "mt-3" : ""}`}
          >
            {voiceThumbnails?.map((file: any, index: number) => (
              <VoiceThumbnails
                key={file.id}
                {...file}
                removeVoice={() => handleRemoveVoice(index)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 py-2 pl-3 pr-4">
            <Tooltips text="Upload from your computer">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-gray-100 rounded-full bg-[#F2F4F7]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept={CHAT_FILE_ACCEPT}
                  multiple
                />

                <Upload size={18} color="#606060" />
              </button>
            </Tooltips>

            <Tooltips
              text={!showFormatting ? "Show formatting" : "Hide formatting"}
            >
              <button
                onClick={() => setShowformatting((prev) => !prev)}
                className="p-1.5 hover:bg-gray-100 rounded text-[#606060] underline"
              >
                Aa
              </button>
            </Tooltips>

            <Tooltips text="Emoji">
              <div className="relative">
                <Popover
                  open={isEmojiPickerOpen}
                  onOpenChange={setIsEmojiPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEmojiPickerOpen((prev) => !prev);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Smile size={18} color="#606060" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="p-0 w-full max-w-xs"
                    onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
                  >
                    <Picker data={data} onEmojiSelect={onEmojiClick} />
                  </PopoverContent>
                </Popover>
              </div>
            </Tooltips>

            <Tooltips text="Mention someone">
              <button
                onClick={handleMentionClick}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                <AtSign size={18} color="#606060" />
              </button>
            </Tooltips>

            <Tooltips text="Mention a channel">
              <button
                onClick={handleChannelMentionClick}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                <Hash size={18} color="#606060" />
              </button>
            </Tooltips>

            <Tooltips text="Slash commands">
              <button
                onClick={handleSlashCommandClick}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                <Slash size={18} color="#606060" />
              </button>
            </Tooltips>

            {show && (
              <Fragment>
                <div className="w-px h-5 bg-[#E6EAEF] hidden sm:flex" />

                {/* <Tooltips text="Record video clip">
                  <button className="p-1.5 hover:bg-gray-100 rounded hidden sm:flex">
                    <Video size={18} color="#606060" />
                  </button>
                </Tooltips> */}

                <Tooltips text="Record audio">
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded hidden sm:flex"
                    onClick={() => setIsRecording(true)}
                    disabled={isRecording}
                  >
                    <Mic size={18} color="#606060" />
                  </button>
                </Tooltips>
              </Fragment>
            )}
          </div>

          <div className="flex items-center gap-1 py-2 pl-3 pr-4">
            <button
              type="submit"
              className="p-1.5 hover:bg-gray-100 rounded size-8 flex items-center justify-center"
              onClick={handleSubmit}
              disabled={
                isEmpty && media?.length === 0 && voiceThumbnails.length === 0
              }
            >
              <SendHorizonal
                color={isEmpty && media?.length === 0 ? "#999" : "black"}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageBox;
