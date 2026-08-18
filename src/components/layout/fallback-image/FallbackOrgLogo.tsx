"use client";

import Image from "next/image";
import { useState } from "react";
import { getInitials } from "~/utils/utils";

interface FallbackImageProps {
  alt?: string;
  userType?: "user" | "bot" | string;
  width?: number;
  height?: number;
  className?: string;
  item: any;
  orgData: any;
}

export default function FallbackOrgLogo({
  item,
  orgData,
  alt = "logo",
  width = 40,
  height = 40,
  className = "rounded-[7px] border object-cover",
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  return (
    <>
      {!error ? (
        <Image
          src={item.avatar_url}
          alt={alt}
          width={width}
          height={height}
          className={className}
          onError={() => setError(true)}
        />
      ) : (
        <h3
          className={`font-bold text-sm ${
            item.org_id === orgData.id ? "text-white" : "text-gray-700"
          }`}
        >
          {getInitials(item?.org_name)}
        </h3>
      )}
    </>
  );
}
