let audioContext: AudioContext | null = null;
let lastJoinSound: { userId: string; at: number } | null = null;

const JOIN_SOUND_DEDUPE_MS = 2000;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }

  return audioContext;
};

const playMeetStyleChime = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.1, now + 0.01);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  const playTone = (frequency: number, start: number, duration: number) => {
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration);
  };

  playTone(523.25, now, 0.14);
  playTone(659.25, now + 0.1, 0.22);
};

export function playBuzzParticipantJoinSound(options?: {
  joiningUserId?: string | number;
  isInCall?: boolean;
  isRecorderSession?: boolean;
}) {
  if (options?.isInCall === false) return;
  if (options?.isRecorderSession) return;

  const joiningUserId = options?.joiningUserId;
  const now = Date.now();

  if (
    joiningUserId != null &&
    lastJoinSound?.userId === String(joiningUserId) &&
    now - lastJoinSound.at < JOIN_SOUND_DEDUPE_MS
  ) {
    return;
  }

  if (joiningUserId != null) {
    lastJoinSound = { userId: String(joiningUserId), at: now };
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx
      .resume()
      .then(() => playMeetStyleChime(ctx))
      .catch(() => {});
    return;
  }

  try {
    playMeetStyleChime(ctx);
  } catch (error) {
    console.warn("Failed to play buzz join sound", error);
  }
}
