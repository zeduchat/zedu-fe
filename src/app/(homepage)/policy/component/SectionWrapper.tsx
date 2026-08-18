import React from "react";
import { cn } from "~/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  variant?: "none" | "small" | "medium" | "large" | "xlarge";
  container?: "default" | "wide" | "full";
  background?: "white" | "gray" | "transparent";
  className?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  variant = "medium",
  container = "default",
  background = "transparent",
  className,
}) => {
  // Vertical spacing variants
  const spacingVariants = {
    none: "py-0",
    small: "py-8 md:py-12",
    medium: "py-12 md:py-16 lg:py-20",
    large: "py-16 md:py-20 lg:py-24",
    xlarge: "py-20 md:py-24 lg:py-32",
  };

  // Container width variants
  const containerVariants = {
    default: "max-w-7xl mx-auto px-4 md:px-6 lg:px-8",
    wide: "max-w-[1136px] mx-auto px-4 md:px-6 lg:px-8 xl:px-16",
    full: "w-full px-4 md:px-6 lg:px-8 xl:px-16",
  };

  // Background variants
  const backgroundVariants = {
    white: "bg-white",
    gray: "bg-gray-50",
    transparent: "bg-transparent",
  };

  return (
    <section
      className={cn(
        spacingVariants[variant],
        backgroundVariants[background],
        className
      )}
    >
      <div className={containerVariants[container]}>{children}</div>
    </section>
  );
};

export default SectionWrapper;
