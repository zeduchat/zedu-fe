import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useEffect } from "react";
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { Participant } from "~/hooks/buzz";
import { ACTIONS } from "~/store/Actions";
import { isRecordingPlaceholderTrack } from "~/lib/buzz/recording-placeholder-track";

type UseAgoraEventsProps = {
  user: any;
  clientRef: MutableRefObject<IAgoraRTCClient | null>;
  isInitialized: boolean;
  data: Participant[];
  setData: Dispatch<SetStateAction<Participant[]>>;
  showInfo: (message: string) => void;
  screenShareClientRef?: MutableRefObject<IAgoraRTCClient | null>;
  setRemoteScreenVideoTrack?: Dispatch<
    SetStateAction<IRemoteVideoTrack | null>
  >;
  setRemoteScreenAudioTrack?: Dispatch<
    SetStateAction<IRemoteAudioTrack | null>
  >;
  dispatch?: Dispatch<{ type: string; payload: unknown }>;
};

export const useAgoraEvents = ({
  clientRef,
  isInitialized,
  setData,
  screenShareClientRef,
  setRemoteScreenVideoTrack,
  setRemoteScreenAudioTrack,
  dispatch,
}: UseAgoraEventsProps) => {
  const savePublishedUintUid = (
    user: IAgoraRTCRemoteUser,
    mediaType: "audio" | "video"
  ) => {
    if (mediaType !== "video" || !dispatch) return;

    const uintUid = (user as { _uintid?: number })._uintid;
    if (typeof uintUid !== "number") return;

    const isScreenShare = String(user.uid).startsWith("screen-");

    dispatch({
      type: ACTIONS.BUZZ_AGORA_UINT_UIDS,
      payload: isScreenShare
        ? { screenShareUintUid: uintUid }
        : { cameraUintUid: uintUid },
    });
  };

  const matchesParticipant = (
    participant: Participant,
    uid: IAgoraRTCRemoteUser["uid"]
  ) =>
    String(participant.user_id) === String(uid) ||
    String(participant.uid) === String(uid);

  const isScreenShareUid = (uid: IAgoraRTCRemoteUser["uid"]) =>
    String(uid).startsWith("screen-");

  const playRemoteAudio = (track: IRemoteAudioTrack | undefined) => {
    if (!track) return;
    track.stop();
    track.play();
  };

  useEffect(() => {
    if (!isInitialized) return;

    let activeClient: IAgoraRTCClient | null = null;
    let attachRetry: ReturnType<typeof setInterval> | null = null;

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (!clientRef.current) return;

      try {
        await clientRef.current.subscribe(user, mediaType);

        if (
          mediaType === "video" &&
          isRecordingPlaceholderTrack(user.videoTrack)
        ) {
          await clientRef.current.unsubscribe(user, "video");
          return;
        }

        setData((prevParticipants) => {
          if (!prevParticipants) return [];
          return prevParticipants.map((p) => {
            if (matchesParticipant(p, user.uid)) {
              return {
                ...p,
                uid: user.uid,
                [mediaType === "video" ? "videoTrack" : "audioTrack"]:
                  mediaType === "video" ? user.videoTrack : user.audioTrack,
              };
            }
            return p;
          });
        });

        savePublishedUintUid(user, mediaType);

        if (mediaType === "audio") playRemoteAudio(user.audioTrack);
      } catch (error) {
        console.error("Agora subscription error:", error);
      }
    };

    const handleUserUnpublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (
        mediaType === "video" &&
        isRecordingPlaceholderTrack(user.videoTrack)
      ) {
        return;
      }

      if (mediaType === "audio") {
        user.audioTrack?.stop();
      }

      setData((prevParticipants) => {
        if (!prevParticipants) return [];
        return prevParticipants.map((p) =>
          matchesParticipant(p, user.uid)
            ? {
                ...p,
                [mediaType === "video" ? "videoTrack" : "audioTrack"]: null,
              }
            : p
        );
      });
    };

    const registerListeners = () => {
      if (!clientRef.current || activeClient) return false;
      activeClient = clientRef.current;
      activeClient.on("user-published", handleUserPublished);
      activeClient.on("user-unpublished", handleUserUnpublished);
      return true;
    };

    if (!registerListeners()) {
      attachRetry = setInterval(() => {
        if (registerListeners() && attachRetry) {
          clearInterval(attachRetry);
          attachRetry = null;
        }
      }, 150);
    }

    return () => {
      if (attachRetry) clearInterval(attachRetry);
      if (activeClient) {
        activeClient.off("user-published", handleUserPublished);
        activeClient.off("user-unpublished", handleUserUnpublished);
      }
    };
  }, [clientRef, isInitialized, setData, dispatch]);

  useEffect(() => {
    if (!isInitialized) return;

    let activeScreenShareClient: IAgoraRTCClient | null = null;
    let attachRetry: ReturnType<typeof setInterval> | null = null;

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (!screenShareClientRef?.current) return;
      if (!isScreenShareUid(user.uid)) return;

      try {
        await screenShareClientRef.current.subscribe(user, mediaType);

        if (mediaType === "video" && setRemoteScreenVideoTrack) {
          setRemoteScreenVideoTrack(user.videoTrack ?? null);
        } else if (mediaType === "audio" && setRemoteScreenAudioTrack) {
          setRemoteScreenAudioTrack(user.audioTrack ?? null);
          playRemoteAudio(user.audioTrack);
        }

        savePublishedUintUid(user, mediaType);
      } catch (e) {
        console.warn("Failed to subscribe to screenshare user", e);
      }
    };

    const handleUserUnpublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (mediaType === "audio") {
        user.audioTrack?.stop();
      }

      if (mediaType === "video" && setRemoteScreenVideoTrack) {
        setRemoteScreenVideoTrack(null);
      } else if (mediaType === "audio" && setRemoteScreenAudioTrack) {
        setRemoteScreenAudioTrack(null);
      }
    };

    const handleUserLeft = (_user: IAgoraRTCRemoteUser) => {
      if (setRemoteScreenVideoTrack) setRemoteScreenVideoTrack(null);
      if (setRemoteScreenAudioTrack) setRemoteScreenAudioTrack(null);
    };

    const registerListeners = () => {
      if (!screenShareClientRef?.current || activeScreenShareClient)
        return false;
      activeScreenShareClient = screenShareClientRef.current;
      activeScreenShareClient.on("user-published", handleUserPublished);
      activeScreenShareClient.on("user-unpublished", handleUserUnpublished);
      activeScreenShareClient.on("user-left", handleUserLeft);
      return true;
    };

    if (!registerListeners()) {
      attachRetry = setInterval(() => {
        if (registerListeners() && attachRetry) {
          clearInterval(attachRetry);
          attachRetry = null;
        }
      }, 150);
    }

    return () => {
      if (attachRetry) clearInterval(attachRetry);
      if (activeScreenShareClient) {
        activeScreenShareClient.off("user-published", handleUserPublished);
        activeScreenShareClient.off("user-unpublished", handleUserUnpublished);
        activeScreenShareClient.off("user-left", handleUserLeft);
      }
    };
  }, [
    screenShareClientRef,
    isInitialized,
    setRemoteScreenVideoTrack,
    setRemoteScreenAudioTrack,
    dispatch,
  ]);
};
