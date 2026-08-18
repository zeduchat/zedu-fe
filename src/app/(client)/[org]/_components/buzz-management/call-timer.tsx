"use client";

import React from "react";
import { Clock } from "lucide-react";

interface CallTimerProps {
  formattedTime: string;
  variant?: "default" | "minimal" | "badge";
  showIcon?: boolean;
  className?: string;
}

export function CallTimer({
  formattedTime,
  variant = "default",
  showIcon = true,
  className = "",
}: CallTimerProps) {
  if (variant === "minimal") {
    return (
      <span className={`text-sm font-mono ${className}`}>{formattedTime}</span>
    );
  }

  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md ${className}`}
      >
        {showIcon && (
          <Clock size={14} className="text-gray-700" strokeWidth={2} />
        )}
        <span className="text-sm font-medium text-gray-700">
          {formattedTime}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Clock size={16} className="text-gray-600" />}
      <span className="text-sm font-mono font-medium">{formattedTime}</span>
    </div>
  );
}
