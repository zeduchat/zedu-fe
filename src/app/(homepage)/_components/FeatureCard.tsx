import React, { JSX } from "react";
import { FilesIcon, CalenderIcon, ChannelSymBol, BuzzIcon } from "./svgs";

type IconKey = "files" | "book" | "channel" | "buzz" | string;

type FeatureCardProps = {
  icon: IconKey;
  title: string;
  description: string;
  className?: string;
};

const ICON_MAP: Record<IconKey, () => JSX.Element> = {
  files: FilesIcon,
  book: CalenderIcon,
  channel: ChannelSymBol,
  buzz: BuzzIcon,
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className = "",
}) => {
  const Icon = ICON_MAP[icon] || BuzzIcon;

  return (
    <div
      className={`h-full text-left w-full rounded-2xl border border-neutral-200/10 bg-blue-50/10 p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 p-1 items-center justify-center rounded-lg bg-primary-50">
          <Icon />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <p className="mt-2 text-sm text-neutral-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
