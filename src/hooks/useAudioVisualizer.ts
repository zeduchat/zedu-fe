import { useEffect, useState, useRef } from "react";
import type {
  ILocalAudioTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";

interface UseAudioVisualizerProps {
  audioTrack:
    | IMicrophoneAudioTrack
    | IRemoteAudioTrack
    | ILocalAudioTrack
    | null;
  threshold?: number;
}

export function useAudioVisualizer({
  audioTrack,
  threshold = 0.1,
}: UseAudioVisualizerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!audioTrack) {
      setIsSpeaking(false);
      setVolume(0);
      return;
    }

    intervalRef.current = setInterval(() => {
      try {
        const level = audioTrack.getVolumeLevel?.() || 0;
        setVolume(level);
        setIsSpeaking(level > threshold);
      } catch (error) {
        console.error("Error getting volume level:", error);
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsSpeaking(false);
      setVolume(0);
    };
  }, [audioTrack, threshold]);

  return { isSpeaking, volume };
}
