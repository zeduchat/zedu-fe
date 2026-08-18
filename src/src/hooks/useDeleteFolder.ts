"use client";
import { useState } from "react";
import { DeleteRequest } from "~/utils/new-request";
import { AxiosError } from "axios";
import { showSuccess, showError } from "~/components/toast/sonner";
export const useDeleteFolder = () => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteFolder = async (folderId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await DeleteRequest(`/files/folders/${folderId}`);

      if (response?.status === 200 || response?.status === 201) {
        showSuccess(response.data.message || "Folder deleted successfully");
        return true;
      }

      showError("Unexpected response from the server.");
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message ||
        "An error occurred while deleting the folder.";
      showError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteFolder, isLoading };
};
