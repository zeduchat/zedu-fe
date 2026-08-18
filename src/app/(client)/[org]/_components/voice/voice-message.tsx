import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Play,
  Pause,
  MoreVertical,
  Download,
  Share2,
  Link2,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import DeleteFileDialog from "../delete-message-modal/delete-file";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { MediaItem } from "../ChannelMessage/message-item";
import Skeleton from "react-loading-skeleton";
import { showInfo } from "~/components/toast/sonner";

type AudioCacheData = Partial<{
  waveform: number[];
  duration: number;
}>;

const audioCache = new Map<string, AudioCacheData>();

interface VoiceMessageProps {
  key: string;
  item: any;
  mediaItem: MediaItem;
}

export const VoiceMessage = ({ mediaItem, item }: VoiceMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [deleteMessage, setDeleteMessage] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const { user } = state;
  const audioUrl = mediaItem.file_link;
  const [waveLoading, setWaveLoading] = useState(true);

  useEffect(() => {
    if (!audioUrl) return;
    const cached = audioCache.get(audioUrl);
    if (cached?.waveform && cached?.duration) {
      setWaveformData(cached.waveform);
      setDuration(cached.duration);
      setWaveLoading(false);
    } else {
      setWaveLoading(true);
      Promise.all([
        !cached?.waveform ? generateWaveform(audioUrl) : Promise.resolve(),
        !cached?.duration ? calculateDuration(audioUrl) : Promise.resolve(),
      ]).finally(() => setWaveLoading(false));
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.playbackRate = playbackSpeed;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const generateWaveform = async (url: string) => {
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 50;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const multiplier = Math.pow(Math.max(...filteredData), -1);
      const normalizedData = filteredData.map((n) => n * multiplier);
      setWaveformData(normalizedData);
      const existing = audioCache.get(url) || {};
      audioCache.set(url, { ...existing, waveform: normalizedData });
      audioContext.close();
    } catch {
      const randomData = Array.from({ length: 50 }, () => Math.random());
      setWaveformData(randomData);
      const existing = audioCache.get(url) || {};
      audioCache.set(url, { ...existing, waveform: randomData });
    }
  };

  const calculateDuration = (url: string) => {
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      const existing = audioCache.get(url) || {};
      audioCache.set(url, { ...existing, duration: audio.duration });
    });
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voice-message-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(audioUrl);
    showInfo("Link copied to clipboard");
  };

  const handleDelete = () => {
    dispatch({ type: ACTIONS.THREAD, payload: item });
    setDeleteMessage(true);
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg border",
          waveLoading ? "w-full md:min-w-[350px]" : "w-full"
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={togglePlayPause}
          className={cn(
            "h-9 w-9 rounded-full flex-shrink-0 bg-primary-500 hover:bg-blue-200 text-white"
          )}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current text-white" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5 text-white" />
          )}
        </Button>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <>
            {waveLoading ? (
              <div className="flex-1 animate-pulse">
                <Skeleton className="h-[10px] w-full" />
              </div>
            ) : (
              <div className="flex items-center gap-[2px] h-8 w-[50px] sm:w-[150px]">
                {waveformData.map((value, index) => {
                  const playedPercentage = (currentTime / duration) * 100;
                  const barPercentage = (index / waveformData.length) * 100;
                  const isPlayed = barPercentage <= playedPercentage;
                  const height = Math.max(4, value * 24);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "w-5.5 sm:w-0.5 rounded-full transition-colors",
                        isPlayed ? "bg-primary-500" : "bg-muted-foreground/30"
                      )}
                      style={{ height: `${height}px` }}
                    />
                  );
                })}
              </div>
            )}
          </>
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
          </span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {playbackSpeed}x
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" align="end">
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
              Playback speed
            </div>
            <div className="space-y-1">
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-blue-500 hover:text-white cursor-pointer transition-colors flex items-center justify-between",
                    playbackSpeed === speed &&
                      "hover:bg-blue-500 hover:text-white cursor-pointer"
                  )}
                >
                  <span>{speed}x</span>
                  {playbackSpeed === speed && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="max-width-[300px] p-1">
            <div className="flex flex-col space-y-1">
              <button
                onClick={handleDownload}
                className="flex items-center w-full px-2 py-1.5 text-sm rounded hover:bg-blue-500 hover:text-white cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" /> Download
              </button>
              <button className="flex items-center w-full px-2 py-1.5 text-sm rounded hover:bg-blue-500 hover:text-white cursor-pointer">
                <Share2 className="h-4 w-4 mr-2" /> Share clip...
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center w-full px-2 py-1.5 text-sm rounded hover:bg-blue-500 hover:text-white cursor-pointer"
              >
                <Link2 className="h-4 w-4 mr-2" /> Copy link to audio clip
              </button>
              <div className="border-t my-1" />
              {user?.user_id === item?.user_id && (
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-2 py-1.5 text-sm rounded text-destructive hover:bg-red-500 hover:text-white cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete clip
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <DeleteFileDialog
        open={deleteMessage}
        setOpen={setDeleteMessage}
        type="clip"
        mediaItem={mediaItem}
      />
    </div>
  );
};
