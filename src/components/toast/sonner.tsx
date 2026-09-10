import { toast } from "sonner";

export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 4000,
  });
};

export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 3000,
  });
};

export const showRecordingSaved = (filesPath: string) => {
  toast.success("Recording saved", {
    description: "Find this Buzz recording on the Files page.",
    duration: 8000,
    action: {
      label: "Open Files",
      onClick: () => {
        window.location.assign(filesPath);
      },
    },
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, {
    duration: Number.POSITIVE_INFINITY,
  });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 3500,
  });
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};
