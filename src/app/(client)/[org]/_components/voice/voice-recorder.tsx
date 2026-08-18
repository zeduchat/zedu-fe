import { useState, useRef, useEffect } from "react";
import { Mic, X, Send } from "lucide-react";
import { Button } from "~/components/ui/button";

interface VoiceRecorderProps {
  onSend: any;
  onCancel: () => void;
}

export const VoiceRecorder = ({ onSend, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(
    Array(20).fill(0.2)
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startRecording();
    return cleanup;
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.7;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let startTime = 0;

      mediaRecorder.onstart = () => {
        startTime = audioContext.currentTime; // mark accurate start time
        timerRef.current = setInterval(() => {
          const elapsed = Math.floor(audioContext.currentTime - startTime);
          setDuration(elapsed);
        }, 500);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // waveform animation
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const bars = Array.from(dataArray.slice(0, 20)).map((v) =>
          Math.max(0.1, (v / 255) * 0.9)
        );
        setWaveformBars(bars);
        animationRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch (error) {
      console.error("Microphone access error:", error);
      onCancel();
    }
  };

  const handleSend = () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    const recorder = mediaRecorderRef.current;
    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      onSend(audioBlob, duration);
      cleanup();
    };
    recorder.stop();
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    onCancel();
  };

  const cleanup = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop waveform animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Close audio context safely
    if (audioContextRef.current) {
      const ctx = audioContextRef.current;
      if (ctx.state !== "closed") {
        ctx.close().catch(() => {});
      }
      audioContextRef.current = null;
    }

    // Stop all microphone tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        if (track.readyState === "live") track.stop();
      });
      streamRef.current = null;
    }

    // Reset recording state
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  //

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 flex justify-center animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-background border border-border rounded-full shadow-lg max-w-md">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <div className="absolute inset-0 rounded-full bg-recording animate-ping opacity-25" />
        </div>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-sm font-medium text-recording tabular-nums">
            {formatTime(duration)}
          </span>

          <div className="flex items-center gap-0.5 h-6 flex-1">
            {waveformBars.map((height, index) => (
              <div
                key={index}
                className="w-0.5 bg-primary-500 rounded-full transition-all duration-75"
                style={{
                  height: `${height * 100}%`,
                  minHeight: "12%",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            onClick={handleSend}
            className="h-8 w-8 bg-primary-500 hover:bg-primary/90 text-primary-foreground rounded-full"
          >
            <Send className="h-3.5 w-3.5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};
