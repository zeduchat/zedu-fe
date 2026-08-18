import OneSignal from "react-onesignal";

declare global {
  interface Window {
    __oneSignalInitPromise?: Promise<void>;
    __oneSignalInitialized?: boolean;
  }
}

export const initOneSignalSafely = async () => {
  if (typeof window === "undefined") return;

  if (window.__oneSignalInitialized) return;

  if (!window.__oneSignalInitPromise) {
    window.__oneSignalInitPromise = OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
      serviceWorkerPath: "/OneSignalSDKWorker.js",
      serviceWorkerUpdaterPath: "/OneSignalSDKUpdaterWorker.js",
    })
      .then(() => {
        window.__oneSignalInitialized = true;
      })
      .catch((error: any) => {
        const message = error?.message || "";
        if (message.includes("SDK already initialized")) {
          window.__oneSignalInitialized = true;
          return;
        }
        throw error;
      });
  }

  await window.__oneSignalInitPromise;
};
