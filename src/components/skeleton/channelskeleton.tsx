"use client";
import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

//

const ChannelSkeleton = () => {
  return (
    <>
      <div className="w-full bg-neutral-50 p-3 rounded-md mb-3">
        <Skeleton
          className="h-[20px] w-full rounded-md"
          data-testid="skeleton"
        />
      </div>
      <div className="w-full bg-neutral-50 p-3 rounded-md mb-3">
        <Skeleton
          className="h-[20px] w-full rounded-md"
          data-testid="skeleton"
        />
      </div>
      <div className="w-full bg-neutral-50 p-3 rounded-md mb-3">
        <Skeleton
          className="h-[20px] w-full rounded-md"
          data-testid="skeleton"
        />
      </div>
    </>
  );
};

export default ChannelSkeleton;
