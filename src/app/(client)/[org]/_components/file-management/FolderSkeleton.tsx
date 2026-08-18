import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

const FolderSkeleton: React.FC = () => {
  return (
    <div className="min-w-[180px] max-w-[300px] p-3 flex items-center justify-between border rounded-md">
      <div className="flex items-center gap-2 overflow-hidden">
        <Skeleton className="h-6 w-6" />
        <div className="flex flex-col px-2 overflow-hidden space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-3 w-[50px]" />
        </div>
      </div>
      <Skeleton className="h-5 w-5" />
    </div>
  );
};

export default FolderSkeleton;
