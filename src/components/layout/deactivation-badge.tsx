import { cn } from "~/lib/utils";
import {
  getDeactivationLabel,
  type DeactivationLabel,
} from "~/utils/user-deactivation";

interface DeactivationBadgeProps {
  user?: any;
  label?: DeactivationLabel | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  sm: "px-1 py-px text-[9px]",
  md: "px-1.5 py-0.5 text-[10px]",
  lg: "px-2 py-1 text-[11px]",
};

export function DeactivationBadge({
  user,
  label: labelProp,
  size = "md",
  className,
}: DeactivationBadgeProps) {
  const label = labelProp ?? getDeactivationLabel(user);
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-[4px] font-bold uppercase tracking-[0.04em] leading-none",
        label === "Deactivated"
          ? "bg-[#E8E8E8] text-[#616061]"
          : "bg-[#FFF6D6] text-[#8C6A00]",
        SIZE_CLASS[size],
        className
      )}
    >
      {label}
    </span>
  );
}
