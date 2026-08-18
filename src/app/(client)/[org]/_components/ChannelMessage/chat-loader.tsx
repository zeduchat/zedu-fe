"use client";

import React, { useEffect, useState } from "react";

const ChatLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 80); // Adjust speed as needed

    return () => clearInterval(interval);
  }, []);

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="flex items-center px-4 my-3">
      <div className="relative w-full max-w-4xl h-4 rounded-full bg-indigo-50 overflow-hidden shadow-inner">
        <div
          key={progress === 0 ? "reset" : "fill"}
          className="absolute left-0 top-0 h-full bg-[repeating-linear-gradient(45deg,#6366f1_0px,#6366f1_6px,transparent_6px,transparent_12px)] transition-all duration-100"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {/* <div className="ml-3 text-sm text-gray-500 font-medium w-10 text-right">
                {clampedProgress}%
            </div> */}
    </div>
  );
};

export default ChatLoader;
