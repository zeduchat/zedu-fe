"use client";
import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

//

const NotificationSkeleton = () => {
  return (
    <div className="mt-10">
      <div className="w-full bg-neutral-50 p-3 rounded-md mb-4">
        <Skeleton
          className="h-[60px] w-full rounded-md"
          data-testid="skeleton"
        />
      </div>
      <div className="w-full bg-neutral-50 p-3 rounded-md mb-4">
        <Skeleton
          className="h-[60px] w-full rounded-md"
          data-testid="skeleton"
        />
      </div>
      <div className="w-full bg-neutral-50 p-3 rounded-md mb-4">
        <Skeleton
          className="h-[60px] w-full rounded-md"
          data-testid="skeleton"
        />
      </div>
      <div className="w-full bg-neutral-50 p-3 rounded-md mb-4">
        <Skeleton
          className="h-[60px] w-full rounded-md"
          data-testid="skeleton"
        />
      </div>
      <div className="w-full bg-neutral-50 p-3 rounded-md mb-4">
        <Skeleton
          className="h-[60px] w-full rounded-md"
          data-testid="skeleton"
        />
      </div>
    </div>
  );
};

export default NotificationSkeleton;
