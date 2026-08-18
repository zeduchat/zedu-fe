import type {
  IAgoraRTC,
  ILocalVideoTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";

const DEFAULT_COLOR = "#4848AD";

// Base sizes from CallParticipant.tsx; scaled up slightly for 1080p recording.
const UI_AVATAR_SIZE = 80;
const UI_NAME_FONT_SIZE = 14;
const UI_INITIAL_FONT_SIZE = 36;
const UI_AVATAR_NAME_GAP = 20;
const RECORDING_UI_SCALE = 2;

const AVATAR_SIZE = UI_AVATAR_SIZE * RECORDING_UI_SCALE;
const NAME_FONT_SIZE = UI_NAME_FONT_SIZE * RECORDING_UI_SCALE;
const INITIAL_FONT_SIZE = UI_INITIAL_FONT_SIZE * RECORDING_UI_SCALE;
const AVATAR_NAME_GAP = UI_AVATAR_NAME_GAP * RECORDING_UI_SCALE;

export const RECORDING_PLACEHOLDER_WIDTH = 1920;
export const RECORDING_PLACEHOLDER_HEIGHT = 1080;

const WIDTH = RECORDING_PLACEHOLDER_WIDTH;
const HEIGHT = RECORDING_PLACEHOLDER_HEIGHT;
const FPS = 5;

const PLACEHOLDER_SIGNATURES = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 640, height: 360 },
] as const;

type VideoTrackLike = ILocalVideoTrack | IRemoteVideoTrack;

export function isRecordingPlaceholderTrack(
  track: VideoTrackLike | null | undefined
): boolean {
  if (!track) return false;

  const mediaTrack = track.getMediaStreamTrack?.();
  if (!mediaTrack) return false;

  if (mediaTrack.label?.toLowerCase().includes("canvas")) return true;

  const { width, height } = mediaTrack.getSettings?.() ?? {};
  if (!width || !height) return false;

  return PLACEHOLDER_SIGNATURES.some(
    (sig) => sig.width === width && sig.height === height
  );
}

export type PlaceholderTileOptions = {
  name: string;
  avatarUrl?: string;
  color?: string;
};

export type PlaceholderTrackSession = {
  track: ILocalVideoTrack;
  canvas: HTMLCanvasElement;
  mediaStream: MediaStream;
  tickInterval: ReturnType<typeof setInterval>;
};

function mixHexWithBlack(hex: string, hexWeight = 0.8): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return DEFAULT_COLOR;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const blackWeight = 1 - hexWeight;

  const mix = (channel: number) =>
    Math.round(channel * hexWeight + 0 * blackWeight);

  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

async function loadAvatarImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  let label = text;
  while (ctx.measureText(label).width > maxWidth && label.length > 1) {
    label = `${label.slice(0, -2)}…`;
  }
  return label;
}

function drawNameLabel(
  ctx: CanvasRenderingContext2D,
  displayName: string,
  centerX: number,
  nameY: number
) {
  ctx.font = `500 ${NAME_FONT_SIZE}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxNameWidth = WIDTH * 0.75;
  const label = truncateText(ctx, displayName, maxNameWidth);

  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, centerX, nameY);
}

export function drawPlaceholderFrame(
  ctx: CanvasRenderingContext2D,
  options: PlaceholderTileOptions,
  avatarImage: HTMLImageElement | null
) {
  const background = options.color || DEFAULT_COLOR;
  const darker = mixHexWithBlack(background, 0.8);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const centerX = Math.round(WIDTH / 2);
  const avatarRadius = Math.round(AVATAR_SIZE / 2);
  const contentHeight = AVATAR_SIZE + AVATAR_NAME_GAP + NAME_FONT_SIZE;
  const centerY = Math.round(HEIGHT / 2 - contentHeight / 2 + avatarRadius);

  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
  ctx.fillStyle = darker;
  ctx.fill();

  if (avatarImage) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      avatarImage,
      centerX - avatarRadius,
      centerY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2
    );
    ctx.restore();
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.font = `300 ${INITIAL_FONT_SIZE}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const initial = (options.name || "?").charAt(0).toUpperCase();
    ctx.fillText(initial, centerX, centerY);
  }

  const displayName = (options.name || "Participant").trim() || "Participant";
  const nameY = Math.round(
    centerY + avatarRadius + AVATAR_NAME_GAP + NAME_FONT_SIZE / 2
  );
  drawNameLabel(ctx, displayName, centerX, nameY);
}

export async function createPlaceholderTrackSession(
  AgoraRTC: IAgoraRTC,
  options: PlaceholderTileOptions
): Promise<PlaceholderTrackSession> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  const avatarImage = options.avatarUrl
    ? await loadAvatarImage(options.avatarUrl)
    : null;

  drawPlaceholderFrame(ctx, options, avatarImage);

  const mediaStream = canvas.captureStream(FPS);
  const mediaStreamTrack = mediaStream.getVideoTracks()[0];
  if (!mediaStreamTrack) {
    throw new Error("Failed to create canvas video track");
  }

  const track = AgoraRTC.createCustomVideoTrack({
    mediaStreamTrack,
    width: WIDTH,
    height: HEIGHT,
    frameRate: FPS,
    optimizationMode: "detail",
    bitrateMax: 3000,
    bitrateMin: 1000,
  });

  const tickInterval = setInterval(() => {
    drawPlaceholderFrame(ctx, options, avatarImage);
  }, 1000 / FPS);

  return { track, canvas, mediaStream, tickInterval };
}

export function destroyPlaceholderTrackSession(
  session: PlaceholderTrackSession | null | undefined
) {
  if (!session) return;

  clearInterval(session.tickInterval);
  session.track.stop();
  session.track.close();
  session.mediaStream.getTracks().forEach((track) => track.stop());
}
