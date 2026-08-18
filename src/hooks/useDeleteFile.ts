"use client";
import { useState } from "react";
import { DeleteRequest } from "~/utils/new-request";
import { AxiosError } from "axios";
import { showError, showSuccess } from "~/components/toast/sonner";

export const useDeleteFile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteFile = async (
    fileId: string,
    permanently?: boolean
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const url = permanently
        ? `/files/file/${fileId}?permanent=true`
        : `/files/file/${fileId}`;
      const response = await DeleteRequest(url);

      if (response?.status === 200 || response?.status === 201) {
        showSuccess(response.data.message || "File deleted successfully");
        return true;
      }

      showError("Unexpected response from the server.");
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message ||
        "An error occurred while deleting the file.";
      showError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeleteFiles = async (
    fileIds: string[],
    permanently?: boolean
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const fileId of fileIds) {
        const url = permanently
          ? `/files/file/${fileId}?permanent=true`
          : `/files/file/${fileId}`;
        const response = await DeleteRequest(url);

        if (response?.status === 200 || response?.status === 201) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(
          `${successCount} file${successCount > 1 ? "s" : ""} deleted successfully`
        );
      }

      if (failCount > 0) {
        showError(
          `Failed to delete ${failCount} file${failCount > 1 ? "s" : ""}`
        );
      }

      return failCount === 0;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message ||
        "An error occurred while deleting files.";
      showError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteFile, bulkDeleteFiles, isLoading };
};
