import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import ImageViewer from "./image-viewer";
import {
  ArrowBigRight,
  Download,
  DownloadIcon,
  File as FileIcon,
  Link2,
  MoreVertical,
  Share2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { getFileIconClass } from "../file-management/FileList";
import PreviewLinks from "./preview-links";
import { VoiceMessage } from "../voice/voice-message";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import DeleteFileDialog from "../delete-message-modal/delete-file";
import { showInfo } from "~/components/toast/sonner";
import GlobalMention from "../hover-card/global-mention";
import ShareFileModal from "./share-file-modal";
import DocumentAttachmentCard from "./document-attachment-card";
import DocumentPreviewModal from "./document-preview-modal";
import { Media } from "~/types/channel";
import { linkifyText } from "~/utils/linkify-text";
import {
  getDocumentCategory,
  isPreviewableDocument,
} from "~/utils/document-files";
import { useRouter } from "next/navigation";

/** @eslint-disable */

export type MediaItem = Media;

interface MessageItemProps {
  item: {
    message: string;
    media?: MediaItem[];
    type: string;
  };
}

type MediaCategory = "image" | "video" | "audio" | "document" | "file";

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
]);
const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "ogv",
  "m4v",
]);
const AUDIO_EXTENSIONS = new Set([
  "wav",
  "m4a",
  "mp3",
  "ogg",
  "aac",
  "flac",
  "opus",
  "weba",
]);

const normalizeExtension = (fileType: string, fileName: string): string => {
  const fromType = (fileType || "").toLowerCase().replace(/^\./, "");
  if (fromType && fromType !== "file") return fromType;
  const parts = (fileName || "").split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
};

const getMediaCategory = (mediaItem: MediaItem): MediaCategory => {
  const mime = (mediaItem.mime_type || "").toLowerCase().split(";")[0].trim();
  const ext = normalizeExtension(mediaItem.file_type, mediaItem.file_name);

  if (mime.startsWith("audio/") || AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (mime.startsWith("video/") || VIDEO_EXTENSIONS.has(ext)) return "video";
  if (mime === "application/octet-stream" && VIDEO_EXTENSIONS.has(ext)) {
    return "video";
  }
  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(ext)) return "image";
  if (isPreviewableDocument(getDocumentCategory(mediaItem))) return "document";

  return "file";
};

// Utility function to check for links
const hasLinks = (text: string): boolean => {
  // Simple regex to detect common URL patterns
  const urlRegex =
    /((?:https?:\/\/|www\.)[^\s<"]+|\b\w+\.(?:com|co|ng|net|org|io|dev|ai|app|cc)\b)/gi;
  return urlRegex.test(text);
};

const MessageItem: React.FC<MessageItemProps> = ({ item }) => {
  const { state } = useContext(DataContext);
  const currentUser = state?.user;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<any>(null);
  const [previewDocument, setPreviewDocument] = useState<MediaItem | null>(
    null
  );
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const COLLAPSED_HEIGHT = 150;

  const trimmedMessage = item.message
    .replace(/\n{2,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "");

  const messageHasLinks = hasLinks(trimmedMessage);

  const handleMessageLinkClick = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const linkifyOptions = useMemo(
    () => ({ onMessageLinkClick: handleMessageLinkClick }),
    [handleMessageLinkClick]
  );

  useEffect(() => {
    if (typeof Prism !== "undefined") {
      Prism.highlightAll();
    }

    const el = contentRef.current;
    if (el) {
      const overflow = el.scrollHeight > COLLAPSED_HEIGHT + 2;
      setIsOverflowing(overflow);
    }
  }, [trimmedMessage, isExpanded]);

  const renderTextWithMentions = (node: any) => {
    if (!node || !node.props) return node;

    const props = node.props;
    const children = props.children;

    if (
      (props["data-id"] || props["data-label"]) &&
      typeof children === "string"
    ) {
      const textValue = String(children).trim();
      const trigger = textValue.startsWith("@")
        ? "@"
        : textValue.startsWith("#")
          ? "#"
          : null;
      if (trigger) {
        const label = props["data-label"] ?? textValue.slice(1).trim();
        return (
          <GlobalMention
            key={props["data-id"] ?? label}
            id={props["data-id"]}
            trigger={trigger}
            label={label}
            item={item}
            currentUser={currentUser}
          />
        );
      }
    }

    if (typeof children === "string") {
      const mentionRegex = /([@#][a-zA-Z0-9_.-]+(?:\s[a-zA-Z0-9_.-]+)*)/g;
      const parts = children.split(mentionRegex);

      return parts.map((part: any, i: number) => {
        if (typeof part === "string" && part.startsWith("@")) {
          return (
            <GlobalMention
              key={`${part.slice(1)}-${i}`}
              id={props["data-id"]}
              trigger="@"
              label={part.slice(1).trim()}
              item={item}
              currentUser={currentUser}
            />
          );
        }
        if (typeof part === "string" && part.startsWith("#")) {
          return (
            <GlobalMention
              key={`${part.slice(1)}-${i}`}
              id={props["data-id"]}
              trigger="#"
              label={part.slice(1).trim()}
              item={item}
              currentUser={currentUser}
            />
          );
        }
        return linkifyText(part, linkifyOptions);
      });
    }

    return node;
  };

  return (
    <div>
      <div className="w-full text-[#344054] text-[13px] lg:text-[15px] font-[400] break-words custom-message">
        <div
          ref={contentRef}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            maxHeight:
              !isExpanded && isOverflowing ? `${COLLAPSED_HEIGHT}px` : "none",
            overflow: !isExpanded && isOverflowing ? "hidden" : "visible",
            position: "relative",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ children }) => {
                return (
                  <p
                    style={{
                      margin: "0",
                      lineHeight: "22px",
                      color: item?.type === "system" ? "#aaa" : "",
                      wordBreak: "break-word",
                    }}
                  >
                    {React.Children.map(children, (child) => {
                      return typeof child === "string"
                        ? linkifyText(child, linkifyOptions)
                        : renderTextWithMentions(child);
                    })}
                  </p>
                );
              },
              a: ({ ...props }) => (
                <a
                  {...props}
                  style={{ textDecoration: "underline", color: "blue" }}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              table: (props) => (
                <table
                  style={{ width: "100%", wordBreak: "break-word" }}
                  {...props}
                />
              ),
              th: (props) => (
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    wordBreak: "break-word",
                  }}
                  {...props}
                />
              ),
              td: (props) => (
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    wordBreak: "break-word",
                  }}
                  {...props}
                />
              ),
              // p: (props) => {
              //   console.log("Rendering paragraph with props:", props);
              //   return (
              //     <p
              //       style={{
              //         color: item?.type === "system" ? "#aaa" : "",
              //         wordBreak: "break-word",
              //         margin: "0",
              //         lineHeight: "22px",
              //       }}
              //       {...props}
              //     />
              //   )
              // },

              pre: ({ children, ...rest }) => (
                <pre className="slack-code-block" {...rest}>
                  {children}
                </pre>
              ),

              code: ({ className, children, ...rest }) => {
                const content = String(children).replace(/\n$/, "");

                if (className?.includes("slack-inline-code")) {
                  return (
                    <code className="slack-inline-code" {...rest}>
                      {children}
                    </code>
                  );
                }

                if (className && /language-(\w+)/.exec(className)) {
                  return (
                    <code className={className} {...rest}>
                      {content}
                    </code>
                  );
                }

                if (content.includes("\n")) {
                  return <code {...rest}>{content}</code>;
                }

                return (
                  <code className="slack-inline-code" {...rest}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {trimmedMessage}
          </ReactMarkdown>

          {/* Gradient overlay when collapsed */}
          {!isExpanded && isOverflowing && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 48,
                background:
                  "linear-gradient(transparent, rgba(255,255,255,0.9))",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* See more / See less toggle */}
        {isOverflowing && (
          <div className="mt-2">
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                See more
              </button>
            ) : (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                See less
              </button>
            )}
          </div>
        )}
      </div>

      {messageHasLinks && <PreviewLinks item={item} />}

      {item.media && item.media.length > 0 && (
        <div className="mt-2 flex items-start flex-wrap gap-4">
          {item?.media?.map((mediaItem: MediaItem) => {
            const category = getMediaCategory(mediaItem);

            switch (category) {
              case "document":
                return (
                  <DocumentAttachmentCard
                    key={mediaItem.id}
                    mediaItem={mediaItem}
                    item={item}
                    onOpenPreview={() => setPreviewDocument(mediaItem)}
                  />
                );
              case "audio":
                return (
                  <VoiceMessage
                    key={mediaItem.id}
                    mediaItem={mediaItem}
                    item={item}
                  />
                );
              case "video":
                return (
                  <VideoWithDownload
                    key={mediaItem.id}
                    mediaItem={mediaItem}
                    item={item}
                  />
                );
              case "image":
                return (
                  <ImageWithDownload
                    key={mediaItem.id}
                    mediaItem={mediaItem}
                    setIsOpen={setIsOpen}
                    setImage={setImage}
                    item={item}
                  />
                );
              default:
                return (
                  <FileWithDownload
                    key={mediaItem.id}
                    mediaItem={mediaItem}
                    item={item}
                  />
                );
            }
          })}
        </div>
      )}

      {isOpen && (
        <ImageViewer
          item={item}
          image={image}
          onClose={() => setIsOpen(false)}
        />
      )}

      {previewDocument && (
        <DocumentPreviewModal
          mediaItem={previewDocument}
          item={item}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
};

const useMediaActions = (mediaItem: MediaItem, item: any) => {
  const { dispatch } = useContext(DataContext);
  const [deleteMessage, setDeleteMessage] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(mediaItem.file_link);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = mediaItem.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mediaItem.file_link);
    showInfo("Link copied to clipboard");
  };

  const handleDelete = () => {
    dispatch({ type: ACTIONS.THREAD, payload: item });
    setDeleteMessage(true);
  };

  return {
    deleteMessage,
    setDeleteMessage,
    shareOpen,
    setShareOpen,
    handleDownload,
    handleCopyLink,
    handleDelete,
  };
};

const MediaActionMenu: React.FC<{
  onDownload: (e: React.MouseEvent) => void;
  onCopyLink: () => void;
  onShare: () => void;
  onDelete: () => void;
}> = ({ onDownload, onCopyLink, onShare, onDelete }) => (
  <>
    <div className="hover:bg-gray-200 rounded-md p-1" onClick={onDownload}>
      <DownloadIcon size={18} />
    </div>

    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="max-width-[300px] p-1">
        <div className="flex flex-col space-y-1">
          <button
            onClick={onDownload}
            className="flex items-center w-full px-2 py-1.5 text-sm rounded hover:bg-blue-500 hover:text-white cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" /> Download
          </button>

          <button
            onClick={onShare}
            className="flex items-center w-full px-2 py-1.5 text-sm rounded hover:bg-blue-500 hover:text-white cursor-pointer"
          >
            <Share2 className="h-4 w-4 mr-2" /> Share file...
          </button>

          <button
            onClick={onCopyLink}
            className="flex items-center w-full px-2 py-1.5 text-sm rounded hover:bg-blue-500 hover:text-white cursor-pointer"
          >
            <Link2 className="h-4 w-4 mr-2" /> Copy link to file
          </button>

          <div className="border-t my-1" />

          <button
            onClick={onDelete}
            className="flex items-center w-full px-2 py-1.5 text-sm rounded text-destructive hover:bg-red-500 hover:text-white cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete file
          </button>
        </div>
      </PopoverContent>
    </Popover>
  </>
);

// image download
const ImageWithDownload: React.FC<{
  mediaItem: MediaItem;
  setIsOpen: any;
  setImage: any;
  item: any;
}> = ({ mediaItem, setIsOpen, setImage, item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const {
    deleteMessage,
    setDeleteMessage,
    shareOpen,
    setShareOpen,
    handleDownload,
    handleCopyLink,
    handleDelete,
  } = useMediaActions(mediaItem, item);

  if (imageError) {
    return <FileWithDownload mediaItem={mediaItem} item={item} />;
  }

  return (
    <div
      className="relative rounded-md overflow-hidden w-full md:w-[350px] h-[300px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={mediaItem.file_link}
        alt={mediaItem.file_name}
        className="w-full md:w-[350px] h-[300px] rounded-md object-cover border cursor-pointer"
        onClick={() => {
          setIsOpen(true);
          setImage(mediaItem);
        }}
        onError={() => setImageError(true)}
      />
      {isHovered && (
        <a
          href="#"
          className="flex items-center gap-1 absolute top-2 right-2 bg-white py-1 px-2 rounded-lg z-10"
          title="Download Image"
        >
          <MediaActionMenu
            onDownload={handleDownload}
            onCopyLink={handleCopyLink}
            onShare={() => setShareOpen(true)}
            onDelete={handleDelete}
          />
        </a>
      )}

      <ShareFileModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        mediaItem={mediaItem}
        item={item}
      />

      <DeleteFileDialog
        open={deleteMessage}
        setOpen={setDeleteMessage}
        type="file"
        mediaItem={mediaItem}
      />
    </div>
  );
};

const FileWithDownload: React.FC<{
  mediaItem: MediaItem;
  item: any;
}> = ({ mediaItem, item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const {
    deleteMessage,
    setDeleteMessage,
    shareOpen,
    setShareOpen,
    handleDownload,
    handleCopyLink,
    handleDelete,
  } = useMediaActions(mediaItem, item);

  const ext = normalizeExtension(mediaItem.file_type, mediaItem.file_name);
  const iconSrc = getFileIconClass(mediaItem.file_name);

  return (
    <div
      className="relative border rounded-lg shadow-sm bg-white min-h-[200px] w-[200px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={mediaItem.file_link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50 min-w-0">
          {iconSrc.startsWith("/") ? (
            <Image src={iconSrc} alt="" width={20} height={20} />
          ) : (
            <FileIcon size={20} className="text-gray-500 flex-shrink-0" />
          )}
          <div className="text-xs font-medium text-gray-900 truncate min-w-0">
            {mediaItem.file_name}
          </div>
        </div>

        <div className="flex flex-col justify-center items-center mt-8 gap-2 pb-6">
          {iconSrc.startsWith("/") ? (
            <Image src={iconSrc} alt="" width={50} height={50} />
          ) : (
            <FileIcon size={50} className="text-gray-400" />
          )}
          {ext && (
            <span className="text-xs font-semibold text-blue-500 uppercase">
              {ext}
            </span>
          )}
        </div>
      </a>

      {isHovered && (
        <div className="flex items-center gap-1 absolute top-2 right-2 bg-white py-1 px-2 rounded-lg z-10 shadow-md">
          <MediaActionMenu
            onDownload={handleDownload}
            onCopyLink={handleCopyLink}
            onShare={() => setShareOpen(true)}
            onDelete={handleDelete}
          />
        </div>
      )}

      <ShareFileModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        mediaItem={mediaItem}
        item={item}
      />

      <DeleteFileDialog
        open={deleteMessage}
        setOpen={setDeleteMessage}
        type="file"
        mediaItem={mediaItem}
      />
    </div>
  );
};

// video download
const VideoWithDownload: React.FC<{
  mediaItem: MediaItem;
  item: any;
}> = ({ mediaItem, item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const {
    deleteMessage,
    setDeleteMessage,
    shareOpen,
    setShareOpen,
    handleDownload,
    handleCopyLink,
    handleDelete,
  } = useMediaActions(mediaItem, item);

  return (
    <div
      className="relative rounded-md overflow-hidden w-full md:w-[400px] bg-black/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        src={mediaItem.file_link}
        controls
        playsInline
        className="w-full h-[400px] rounded-md border object-contain bg-black"
        poster={`${mediaItem.file_link}#t=0.1`}
      />
      {isHovered && (
        <div className="flex items-center gap-1 absolute top-2 right-2 bg-white py-1 px-2 rounded-lg cursor-pointer z-10 shadow-md">
          <MediaActionMenu
            onDownload={handleDownload}
            onCopyLink={handleCopyLink}
            onShare={() => setShareOpen(true)}
            onDelete={handleDelete}
          />
        </div>
      )}

      <ShareFileModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        mediaItem={mediaItem}
        item={item}
      />

      <DeleteFileDialog
        open={deleteMessage}
        setOpen={setDeleteMessage}
        type="file"
        mediaItem={mediaItem}
      />
    </div>
  );
};

export default MessageItem;
