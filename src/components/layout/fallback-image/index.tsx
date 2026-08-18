"use client";

import Image from "next/image";
import images from "~/assets/images";

interface FallbackImageProps {
  src?: string;
  defaultAvatarUrl?: string;
  alt?: string;
  userType?: "user" | "bot" | string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
}

export default function FallbackImage({
  src,
  defaultAvatarUrl,
  alt = "avatar",
  userType = "user",
  width = 36,
  height = 36,
  className = "rounded-[7px] border object-cover",
  priority = false,
  loading,
}: FallbackImageProps) {
  const fallbackUser = images.user;
  const fallbackBot = images.bot;

  const lastResortFallback =
    userType === "user" || userType === "" ? fallbackUser : fallbackBot;

  const imageSrc = src || defaultAvatarUrl || lastResortFallback;
  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");

  return (
    <Image
      src={imageSrc || images?.user}
      alt={alt || "avatar"}
      width={width}
      height={height}
      className={className}
      priority={priority}
      loading={resolvedLoading}
      decoding="async"
    />
  );
}
