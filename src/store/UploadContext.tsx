"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status?: "uploading" | "completed" | "failed";
}

interface UploadContextType {
  uploadingFiles: UploadingFile[];

  addUploadingFile: (file: Omit<UploadingFile, "progress">) => void;

  updateUploadProgress: (id: string, progress: number) => void;

  updateUploadStatus: (
    id: string,
    status: "uploading" | "completed" | "failed"
  ) => void;

  removeUploadingFile: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};

export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const addUploadingFile = (file: Omit<UploadingFile, "progress">) => {
    setUploadingFiles((prev) => [
      ...prev,
      { ...file, progress: 0, status: "uploading" },
    ]);
  };

  const updateUploadProgress = (id: string, progress: number) => {
    setUploadingFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, progress } : file))
    );
  };

  const updateUploadStatus = (
    id: string,
    status: "uploading" | "completed" | "failed"
  ) => {
    setUploadingFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, status } : file))
    );
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((file) => file.id !== id));
  };

  return (
    <UploadContext.Provider
      value={{
        uploadingFiles,
        addUploadingFile,
        updateUploadProgress,
        updateUploadStatus,
        removeUploadingFile,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};
