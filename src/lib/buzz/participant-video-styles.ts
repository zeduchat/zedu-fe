export const LOCAL_PARTICIPANT_VIDEO_SCALE = 0.88;
export const REMOTE_PARTICIPANT_VIDEO_SCALE = 1.08;

type ParticipantVideoStyleOptions = {
  mirror?: boolean;
  scale?: number;
};

export function getParticipantVideoScale(isLocalVideo: boolean) {
  return isLocalVideo
    ? LOCAL_PARTICIPANT_VIDEO_SCALE
    : REMOTE_PARTICIPANT_VIDEO_SCALE;
}

function applyMediaStyles(media: HTMLElement, transform: string) {
  media.style.setProperty("width", "100%", "important");
  media.style.setProperty("height", "100%", "important");
  media.style.setProperty("min-width", "100%", "important");
  media.style.setProperty("min-height", "100%", "important");
  media.style.setProperty("object-fit", "cover", "important");
  media.style.setProperty("object-position", "center center", "important");
  media.style.setProperty("transform", transform, "important");
  media.style.setProperty("transform-origin", "center center", "important");
}

function applyWrapperStyles(wrapper: HTMLElement) {
  wrapper.style.setProperty("width", "100%", "important");
  wrapper.style.setProperty("height", "100%", "important");
  wrapper.style.setProperty("overflow", "hidden", "important");
  wrapper.style.setProperty("display", "flex", "important");
  wrapper.style.setProperty("align-items", "center", "important");
  wrapper.style.setProperty("justify-content", "center", "important");
}

export function styleParticipantVideoElements(
  container: HTMLElement,
  {
    mirror = false,
    scale = LOCAL_PARTICIPANT_VIDEO_SCALE,
  }: ParticipantVideoStyleOptions = {}
) {
  const transform = mirror ? `scale(${scale}) scaleX(-1)` : `scale(${scale})`;

  container.style.setProperty("overflow", "hidden", "important");

  container.querySelectorAll("video, canvas").forEach((element) => {
    applyMediaStyles(element as HTMLElement, transform);
  });

  container.querySelectorAll("div").forEach((element) => {
    if (element === container) return;
    if (element.querySelector("video, canvas")) {
      applyWrapperStyles(element as HTMLElement);
    }
  });
}

export function observeParticipantVideoStyles(
  container: HTMLElement,
  options: ParticipantVideoStyleOptions = {}
) {
  const applyStyles = () => styleParticipantVideoElements(container, options);

  applyStyles();

  const observer = new MutationObserver(applyStyles);

  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });

  const retryInterval = window.setInterval(applyStyles, 200);
  const stopRetry = window.setTimeout(() => {
    window.clearInterval(retryInterval);
  }, 3000);

  return () => {
    observer.disconnect();
    window.clearInterval(retryInterval);
    window.clearTimeout(stopRetry);
  };
}
