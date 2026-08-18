"use client";

import React, { useState } from "react";
import { useUpload } from "~/store/UploadContext";
import {
  X,
  Minus,
  Plus,
  File as FileIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const ProgressCircle = ({ progress }: { progress: number }) => {
  const strokeWidth = 4;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className="w-10 h-10 transform -rotate-90">
      <circle
        className="text-gray-300"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={20}
        cy={20}
      />
      <circle
        className="text-blue-600"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={20}
        cy={20}
      />
    </svg>
  );
};

const UploadProgressPopover = () => {
  const { uploadingFiles, removeUploadingFile } = useUpload();
  const [isCollapsed, setIsCollapsed] = useState(false);

  React.useEffect(() => {
    const allCompleted =
      uploadingFiles.length > 0 &&
      uploadingFiles.every((file) => file.status === "completed");

    if (allCompleted) {
      const timer = setTimeout(() => {
        uploadingFiles.forEach((file) => removeUploadingFile(file.id));
      }, 2000); // Hide after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [uploadingFiles, removeUploadingFile]);

  if (uploadingFiles.length === 0) {
    return null;
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleClose = () => {
    // Clear all uploads
    uploadingFiles.forEach((file) => removeUploadingFile(file.id));
  };

  const uploadingCount = uploadingFiles.filter(
    (f) => f.status === "uploading" || !f.status
  ).length;
  const completedCount = uploadingFiles.filter(
    (f) => f.status === "completed"
  ).length;
  const failedCount = uploadingFiles.filter(
    (f) => f.status === "failed"
  ).length;

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]">
      <div
        className="flex justify-between items-center h-[70px] bg-[#F9FAFB] border-b border-[#994BFF] p-4 cursor-pointer"
        onClick={toggleCollapse}
      >
        <div>
          <h3 className="font-semibold text-sm">
            {uploadingCount > 0
              ? `Uploading (${uploadingCount})`
              : `Upload Complete`}
          </h3>
          {(completedCount > 0 || failedCount > 0) && (
            <p className="text-xs text-gray-500 mt-1">
              {completedCount > 0 && `${completedCount} completed`}
              {completedCount > 0 && failedCount > 0 && ", "}
              {failedCount > 0 && `${failedCount} failed`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
            className="text-gray-400 hover:text-gray-600 p-3 bg-white border border-[#994BFF] rounded-md"
          >
            {isCollapsed ? <Plus size={13} /> : <Minus size={13} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-gray-400 hover:text-gray-600 p-3 bg-white border border-[#994BFF] rounded-md"
          >
            <X size={13} />
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="max-h-[400px] overflow-y-auto space-y-2 p-4">
          {uploadingFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileIcon size={24} className="text-gray-500 shrink-0" />
                <div className="text-sm min-w-0 flex-1">
                  <p className="font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.status === "completed" && "Completed"}
                    {file.status === "failed" && "Failed"}
                    {(!file.status || file.status === "uploading") &&
                      `${file.progress}%`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {file.status === "completed" ? (
                  <CheckCircle2 size={24} className="text-green-500" />
                ) : file.status === "failed" ? (
                  <XCircle size={24} className="text-red-500" />
                ) : (
                  <ProgressCircle progress={file.progress} />
                )}
                <button
                  onClick={() => removeUploadingFile(file.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadProgressPopover;
