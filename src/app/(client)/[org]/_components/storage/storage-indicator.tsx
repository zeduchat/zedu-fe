import Image from "next/image";
import { getProgressIcon } from "~/lib/utils";

const StorageIndicator = ({
  storagePercentage,
}: {
  storagePercentage: number;
}) => {
  return (
    <div className="flex-1 bg-[#f9fafb] border border-[#D0D0FD]  rounded-md h-2 mr-3 h-[20px]">
      <Image
        src={getProgressIcon(storagePercentage)}
        alt="Storage progress"
        width={200}
        height={20}
        className="w-full h-full object-cover"
        style={{ width: `${storagePercentage}%` }}
      />
    </div>
  );
};

export default StorageIndicator;
