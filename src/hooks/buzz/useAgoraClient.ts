"use client";
import { useEffect, useRef } from "react";
import type { IAgoraRTCClient } from "agora-rtc-sdk-ng";

export const useAgoraClient = () => {
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  useEffect(() => {
    let isDisposed = false;

    if (typeof window === "undefined") return;

    if (clientRef.current) {
      return;
    }

    (async () => {
      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        const agoraClient: IAgoraRTCClient = AgoraRTC.createClient({
          mode: "rtc",
          codec: "h264",
        });
        // 4 = NONE (silence Agora internal logs in browser console)
        AgoraRTC.setLogLevel(4);
        if (isDisposed) {
          return;
        }

        clientRef.current = agoraClient;
      } catch (error) {
        console.error("Failed to initialize AgoraRTC client:", error);
        clientRef.current = null;
      }
    })();

    return () => {
      isDisposed = true;
    };
  }, []);

  return clientRef;
};
