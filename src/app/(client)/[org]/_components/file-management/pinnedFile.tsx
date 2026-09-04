import { Pin } from "lucide-react";
import Image from "next/image";
import { FileDetails } from "./FileInfo";
import { getFileIconSrc } from "~/utils/file-icons";

export type PinnedFileProps = {
  file: FileDetails;
};

export const PinnedFile = ({ file }: PinnedFileProps) => {
  const iconSrc = getFileIconSrc({
    file_name: file.file_name,
    mime_type: file.mime_type,
    file_type: file.file_type,
  });
  return (
    <div className="min-w-[180px] max-w-[300px] p-3 flex items-start justify-between border rounded-md cursor-pointer hover:bg-gray-100">
      <div className="flex items-center gap-2">
        <Image
          src={iconSrc}
          width={28}
          height={28}
          alt=""
          unoptimized
          className="shrink-0"
        />
        <div className="flex flex-col px-2">
          <span className="text-[15px] break-words">{file.file_name}</span>
          {/* <p className="text-[13px] text-gray-500">{file.size} Items</p> */}
        </div>
      </div>
      <Pin className="flex-shrink-0 ml-4 size-4" />
    </div>
  );
};
