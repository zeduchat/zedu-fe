import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

const FileListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-3 border-b">
        <div className="md:col-span-6">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="md:col-span-1">
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="md:col-span-1">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* File rows skeleton */}
      <div className="divide-y">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-4 items-center"
          >
            {/* Name column */}
            <div className="md:col-span-6 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[120px]" />
              </div>
            </div>

            {/* Owner column */}
            <div className="md:col-span-2 flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-[80px]" />
            </div>

            {/* Date Created column */}
            <div className="md:col-span-2">
              <Skeleton className="h-4 w-[60px]" />
            </div>

            {/* Size column */}
            <div className="md:col-span-1">
              <Skeleton className="h-4 w-[50px]" />
            </div>

            {/* Actions column */}
            <div className="md:col-span-1 flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileListSkeleton;
