"use client";

import { cn } from "~/lib/utils";
import FallbackImage from "~/components/layout/fallback-image";

const SIZE_MAP = {
  tiny: { px: 20, className: "size-5" },
  "2xs": { px: 24, className: "size-6" },
  xs: { px: 28, className: "size-7" },
  sm: { px: 36, className: "size-9" },
  md: { px: 40, className: "size-10" },
  sidebar: { px: 32, className: "size-8" },
  lg: { px: 56, className: "size-14" },
  intro: { px: 64, className: "size-16" },
  xl: { px: 80, className: "size-20" },
  "2xl": { px: 96, className: "size-24" },
} as const;

export type UserAvatarSize = keyof typeof SIZE_MAP;

export type UserAvatarItem = {
  avatar_url?: string;
  default_avatar_url?: string;
  sender_avatar_url?: string;
  sender_default_avatar_url?: string;
  user_type?: string;
};

interface UserAvatarProps {
  item?: UserAvatarItem | null;
  src?: string;
  defaultAvatarUrl?: string;
  userType?: string;
  alt?: string;
  size?: UserAvatarSize;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export default function UserAvatar({
  item,
  src,
  defaultAvatarUrl,
  userType,
  alt = "avatar",
  size = "sm",
  className,
  imageClassName,
  priority = false,
}: UserAvatarProps) {
  const { px, className: sizeClass } = SIZE_MAP[size];

  const resolvedSrc = src ?? item?.avatar_url ?? item?.sender_avatar_url;
  const resolvedDefault =
    defaultAvatarUrl ??
    item?.default_avatar_url ??
    item?.sender_default_avatar_url;
  const resolvedUserType = userType ?? item?.user_type ?? "user";

  return (
    <div className={cn("shrink-0 overflow-hidden", sizeClass, className)}>
      <FallbackImage
        src={resolvedSrc}
        defaultAvatarUrl={resolvedDefault}
        userType={resolvedUserType}
        alt={alt}
        width={px}
        height={px}
        priority={priority}
        className={cn(
          "h-full w-full rounded-[7px] border object-cover object-top",
          imageClassName
        )}
      />
    </div>
  );
}
