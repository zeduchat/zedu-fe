import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { useAgoraClient } from "~/hooks/buzz";
import { getBuzzAgoraToken, getScreenShareBuzzUid } from "~/lib/agora/token";
import { PostRequest } from "~/utils/new-request";
import { showError, showInfo } from "~/components/toast/sonner";
import type {
  IAgoraRTC,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";

// Configuration options for useBuzz hook
export interface UseBuzzOptions {
  skipJoin?: boolean;
  skipMedia?: boolean;
  skipRemoteMute?: boolean;
  minimalMode?: boolean;
  disableEffects?: boolean;
}

export const useBuzz = (options: UseBuzzOptions = {}) => {
  const {
    skipJoin = false,
    skipMedia = false,
    skipRemoteMute = false,
    minimalMode = false,
    disableEffects = false,
  } = options;
  const effectsDisabled = disableEffects || minimalMode;
  const { state, dispatch } = useContext(DataContext);
  const {
    orgId,
    user,
    buzzData,
    hasJoined,
    buzzParticipants,
    muteParticipant,
    buzzView,
  } = state;

  const clientRef = useAgoraClient();
  const screenShareClientRef = useAgoraClient();
  const isJoiningInProgress = useRef(false);
  const AgoraRTC = useRef<IAgoraRTC | null>(null);

  // Track states
  const [audioTrack, setAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [screenVideoTrack, setScreenVideoTrack] =
    useState<ILocalVideoTrack | null>(null);
  const [remoteScreenVideoTrack, setRemoteScreenVideoTrack] =
    useState<IRemoteVideoTrack | null>(null);
  const [remoteScreenAudioTrack, setRemoteScreenAudioTrack] =
    useState<IRemoteAudioTrack | null>(null);

  // Publishing states
  const [isAudioPublishing, setIsAudioPublishing] = useState(false);
  const [isVideoPublishing, setIsVideoPublishing] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Session states
  const [isInitialized, setIsInitialized] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(true);

  // UI states
  const [showParticipant, setShowParticipant] = useState(false);
  const [showBuzzchat, setShowBuzzchat] = useState(false);

  // Helper function to update participants in global state
  const updateGlobalParticipants = useCallback(
    (updateFn: (participants: any[]) => any[]) => {
      if (!buzzParticipants) return;
      const updatedParticipants = updateFn(buzzParticipants);
      dispatch({
        type: ACTIONS.BUZZ_PARTICIPANTS,
        payload: updatedParticipants,
      });
    },
    [buzzParticipants, dispatch]
  );

  // Toggle participant sidebar visibility
  const toggleParticipantSidebar = useCallback(() => {
    setShowBuzzchat(false);
    setShowParticipant(!showParticipant);
  }, [showParticipant]);

  // Toggle chat sidebar visibility
  const toggleChatSidebar = useCallback(() => {
    setShowParticipant(false);
    setShowBuzzchat(!showBuzzchat);
  }, [showBuzzchat]);

  // Start audio track and publish to channel
  const startAudio = useCallback(async () => {
    if (
      !clientRef.current ||
      !AgoraRTC.current ||
      !joined ||
      audioTrack ||
      !user ||
      !buzzData
    )
      return;
    try {
      const track = await AgoraRTC.current.createMicrophoneAudioTrack();
      if (track) {
        await clientRef.current.publish(track);
        setAudioTrack(track);
        setIsAudioPublishing(true);

        const { uid } = buzzData.agora_token;
        updateGlobalParticipants((prev) => {
          const existingIndex = prev.findIndex(
            (p) => p.user_id === user.user_id || p.uid === uid
          );

          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              audioTrack: track,
              audioStatus: "enabled",
            };
            return updated;
          } else {
            return [
              ...prev,
              {
                user_id: user.user_id,
                uid: uid,
                username:
                  user.username ||
                  user.display_name ||
                  user.first_name ||
                  "You",
                avatar_url: user.avatar_url,
                audioTrack: track,
                audioStatus: "enabled",
                videoTrack: null,
                handsRaised: false,
                isPinned: false,
              },
            ];
          }
        });
      }
    } catch (e) {
      console.error("Failed to start audio:", e);
    }
  }, [audioTrack, clientRef, joined, user, buzzData, updateGlobalParticipants]);

  // Start video track and publish to channel
  const startVideo = useCallback(async () => {
    // Add a small delay to allow GreenRoom to release hardware
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!clientRef.current || !AgoraRTC.current || !joined || videoTrack)
      return;

    try {
      const devices = await navigator.mediaDevices
        ?.enumerateDevices?.()
        .catch(() => [] as MediaDeviceInfo[]);

      const videoInputs = (devices || []).filter(
        (d) => d.kind === "videoinput"
      );
      if (videoInputs.length === 0) {
        showError("No camera detected. Connect a camera and try again.");
        setIsVideoPublishing(false);
        return;
      }

      const track = await AgoraRTC.current.createCameraVideoTrack({
        encoderConfig: "720p_1",
      });

      if (track) {
        await clientRef.current.publish(track);
        setVideoTrack(track);
        setIsVideoPublishing(true);

        updateGlobalParticipants((prev) =>
          prev.map((p) =>
            p.user_id === user?.user_id ? { ...p, videoTrack: track } : p
          )
        );
      }
    } catch (e) {
      console.error("Failed to start video:", e);

      const message = e instanceof Error ? e.message : String(e);
      const normalized = message.toUpperCase();

      if (
        normalized.includes("DEVICE_NOT_FOUND") ||
        normalized.includes("NOTFOUNDERROR")
      ) {
        showError(
          "No camera device found. Check your camera connection and macOS camera settings."
        );
      } else if (
        normalized.includes("NOTALLOWEDERROR") ||
        normalized.includes("PERMISSION")
      ) {
        showError(
          "Camera access is blocked. Allow camera permission in browser and macOS settings."
        );
      } else if (
        normalized.includes("NOTREADABLEERROR") ||
        normalized.includes("DEVICE_IN_USE")
      ) {
        showError(
          "Camera is busy in another app. Close other apps using the camera and retry."
        );
      } else if (normalized.includes("OVERCONSTRAINED")) {
        showError(
          "Requested camera settings are not supported by this device."
        );
      } else {
        showError(
          "Failed to start camera. Please retry or reconnect your camera."
        );
      }

      setIsVideoPublishing(false);
    }
  }, [videoTrack, clientRef, joined, user?.user_id, updateGlobalParticipants]);

  // Toggle audio on/off
  const toggleAudio = useCallback(async () => {
    if (!audioTrack) {
      await startAudio();
      return;
    }

    try {
      const newState = !isAudioPublishing;
      await audioTrack.setEnabled(newState);
      setIsAudioPublishing(newState);

      updateGlobalParticipants((prev) =>
        prev.map((p) =>
          p.user_id === user?.user_id
            ? { ...p, audioTrack: newState ? audioTrack : null }
            : p
        )
      );
    } catch (e) {
      console.error("Toggle audio failed", e);
    }
  }, [
    audioTrack,
    isAudioPublishing,
    startAudio,
    user?.user_id,
    updateGlobalParticipants,
  ]);

  // Toggle video on/off
  const toggleVideo = useCallback(async () => {
    if (!videoTrack) {
      await startVideo();
      return;
    }

    try {
      const newState = !isVideoPublishing;
      await videoTrack.setEnabled(newState);
      setIsVideoPublishing(newState);

      updateGlobalParticipants((prev) =>
        prev.map((p) =>
          p.user_id === user?.user_id
            ? { ...p, videoTrack: newState ? videoTrack : null }
            : p
        )
      );
    } catch (e) {
      console.error("Toggle video failed", e);
    }
  }, [
    videoTrack,
    isVideoPublishing,
    startVideo,
    user?.user_id,
    updateGlobalParticipants,
  ]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (screenVideoTrack) {
      await screenShareClientRef?.current?.unpublish(screenVideoTrack);
      screenVideoTrack.stop();
      screenVideoTrack.close();
      setScreenVideoTrack(null);
      setIsScreenSharing(false);
    } else {
      const track = await AgoraRTC.current?.createScreenVideoTrack({}, "auto");
      if (!track) return;
      const vTrack = Array.isArray(track) ? track[0] : track;
      if (screenShareClientRef.current && vTrack) {
        await screenShareClientRef.current.publish(vTrack);
        setScreenVideoTrack(vTrack);
        setIsScreenSharing(true);
      }
    }
  }, [screenVideoTrack, screenShareClientRef]);

  // Toggle hand raise status
  const toggleHandRaise = useCallback(async () => {
    if (!buzzData || !user?.user_id || !orgId) return;

    const localParticipant = buzzParticipants?.find(
      (p: any) => p?.user_id === user?.user_id
    );
    const isHandRaised = localParticipant?.handsRaised ?? false;
    const newHandState = !isHandRaised;

    updateGlobalParticipants((prev) =>
      prev.map((p) =>
        p.user_id === user?.user_id ? { ...p, handsRaised: newHandState } : p
      )
    );

    const payload = {
      sticker: newHandState ? "raise_hand" : "away",
    };

    await PostRequest(`/buzz/${buzzData.buzz_id}/sticker`, payload);
  }, [
    buzzData,
    user?.user_id,
    orgId,
    buzzParticipants,
    updateGlobalParticipants,
  ]);

  // Leave the buzz channel and cleanup
  const handleLeave = useCallback(async () => {
    const currentBuzzId = buzzData?.buzz_id;
    const isLastParticipant = (buzzParticipants || []).length <= 1;

    try {
      if (videoTrack) {
        videoTrack.stop();
        videoTrack.close();
      }
      if (audioTrack) {
        audioTrack.stop();
        audioTrack.close();
      }
      if (screenVideoTrack) {
        screenVideoTrack.stop();
        screenVideoTrack.close();
      }

      setVideoTrack(null);
      setAudioTrack(null);
      setScreenVideoTrack(null);
      setRemoteScreenVideoTrack(null);
      setRemoteScreenAudioTrack(null);
      setIsVideoPublishing(false);
      setIsAudioPublishing(false);
      setIsScreenSharing(false);
      setJoined(false);
      setJoining(true);
      isJoiningInProgress.current = false;

      dispatch({
        type: ACTIONS.BUZZ_PARTICIPANTS,
        payload: (buzzParticipants || []).map((participant: any) => ({
          ...participant,
          videoTrack: null,
          audioTrack: null,
        })),
      });

      if (
        clientRef.current &&
        clientRef.current.connectionState !== "DISCONNECTED"
      ) {
        await clientRef.current.leave();
      }
      if (
        screenShareClientRef.current &&
        screenShareClientRef.current.connectionState !== "DISCONNECTED"
      ) {
        await screenShareClientRef.current.leave();
      }
      if (currentBuzzId) {
        await PostRequest(`/buzz/${currentBuzzId}/leave`);
        if (isLastParticipant) {
          await PostRequest(`/buzz/${currentBuzzId}/end`);
        }
        dispatch({ type: ACTIONS.HAS_JOINED, payload: false });
        dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: false });
      }
    } catch (error) {
      console.error("Error leaving buzz channel:", error);
    }
  }, [
    clientRef,
    screenShareClientRef,
    buzzData?.buzz_id,
    videoTrack,
    audioTrack,
    screenVideoTrack,
    dispatch,
    buzzParticipants,
  ]);

  // End the buzz call for all participants
  const handleEndBuzz = useCallback(async () => {
    const currentBuzzId = buzzData?.buzz_id;

    try {
      if (videoTrack) {
        videoTrack.stop();
        videoTrack.close();
      }
      if (audioTrack) {
        audioTrack.stop();
        audioTrack.close();
      }
      if (screenVideoTrack) {
        screenVideoTrack.stop();
        screenVideoTrack.close();
      }

      setVideoTrack(null);
      setAudioTrack(null);
      setScreenVideoTrack(null);
      setRemoteScreenVideoTrack(null);
      setRemoteScreenAudioTrack(null);
      setIsVideoPublishing(false);
      setIsAudioPublishing(false);
      setIsScreenSharing(false);
      setJoined(false);
      setJoining(true);
      isJoiningInProgress.current = false;

      dispatch({
        type: ACTIONS.BUZZ_PARTICIPANTS,
        payload: (buzzParticipants || []).map((participant: any) => ({
          ...participant,
          videoTrack: null,
          audioTrack: null,
        })),
      });

      if (
        clientRef.current &&
        clientRef.current.connectionState !== "DISCONNECTED"
      ) {
        await clientRef.current.leave();
      }
      if (
        screenShareClientRef.current &&
        screenShareClientRef.current.connectionState !== "DISCONNECTED"
      ) {
        await screenShareClientRef.current.leave();
      }
      if (currentBuzzId) {
        await PostRequest(`/buzz/${currentBuzzId}/end`);
        dispatch({ type: ACTIONS.HAS_JOINED, payload: false });
        dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: false });
      }
    } catch (error) {
      console.error("Error ending buzz call:", error);
    }
  }, [
    clientRef,
    screenShareClientRef,
    buzzData?.buzz_id,
    videoTrack,
    audioTrack,
    screenVideoTrack,
    dispatch,
    buzzParticipants,
  ]);

  // Toggle full page view
  const toggleFullPage = useCallback(() => {
    dispatch({
      type: ACTIONS.BUZZ_VIEW,
      payload: buzzView === "full" ? "side" : "full",
    });
  }, [dispatch, buzzView]);

  // Initialize Agora SDK
  useEffect(() => {
    // Skip if in minimal mode or media is disabled
    if (effectsDisabled || skipMedia) return;

    if (typeof window !== "undefined" && !AgoraRTC.current) {
      import("agora-rtc-sdk-ng").then((mod) => {
        AgoraRTC.current = mod.default;
        setIsInitialized(true);
      });
    }
  }, [effectsDisabled, skipMedia]);

  // Join Agora channel when ready
  useEffect(() => {
    if (effectsDisabled || skipJoin) return;

    const joinChannel = async () => {
      if (
        !isInitialized ||
        joined ||
        !hasJoined ||
        !user ||
        isJoiningInProgress.current
      )
        return;

      try {
        isJoiningInProgress.current = true;

        const { buzz_id, agora_token } = buzzData;
        const { uid, token, app_id } = agora_token;

        if (
          clientRef.current &&
          clientRef.current.connectionState === "DISCONNECTED"
        ) {
          await clientRef.current.join(app_id, buzz_id, token, uid);

          clientRef.current.remoteUsers.forEach(async (user) => {
            if (user.hasVideo || user.hasAudio) {
              const mediaType = user.hasVideo ? "video" : "audio";

              await clientRef.current?.subscribe(user, mediaType);

              updateGlobalParticipants((prev) =>
                prev.map((p) =>
                  String(p.user_id) === String(user.uid)
                    ? {
                        ...p,
                        videoTrack: user.videoTrack || p.videoTrack,
                        audioTrack: user.audioTrack || p.audioTrack,
                      }
                    : p
                )
              );
            }
          });
        }

        if (
          screenShareClientRef.current &&
          screenShareClientRef.current.connectionState === "DISCONNECTED"
        ) {
          const { token: sToken, uid: sUid } = await getBuzzAgoraToken({
            buzz_id,
            uid: getScreenShareBuzzUid(uid),
          });
          await screenShareClientRef.current.join(
            app_id,
            `screen-${buzz_id}`,
            sToken,
            sUid
          );
        }

        setJoined(true);
        setJoining(false);
        isJoiningInProgress.current = false;
      } catch (err) {
        console.error(err);
        showError("Error joining buzz");
        isJoiningInProgress.current = false;
        setJoined(false);
        setJoining(false);
      }
    };

    if (hasJoined) {
      joinChannel();
    }
  }, [
    effectsDisabled,
    skipJoin,
    isInitialized,
    user,
    dispatch,
    hasJoined,
    buzzData,
    clientRef,
    screenShareClientRef,
    updateGlobalParticipants,
  ]);

  //   Handle remote mute from host
  useEffect(() => {
    // Skip if in minimal mode or remote mute is disabled
    if (effectsDisabled || skipRemoteMute) return;

    const handleRemoteMute = async () => {
      const isHost = String(buzzData?.host_id) === String(user?.user_id);

      if (!isHost) {
        try {
          if (audioTrack) {
            await audioTrack.setEnabled(false);
            setIsAudioPublishing(false);

            updateGlobalParticipants((prev) =>
              prev.map((p) =>
                p.user_id === user?.user_id ? { ...p, audioTrack: null } : p
              )
            );

            showInfo("The host has muted all participants");
          }
        } catch (e) {
          console.log("Failed to execute remote mute:", e);
        }
      }
    };

    handleRemoteMute();
  }, [effectsDisabled, skipRemoteMute, muteParticipant]);

  return {
    // State
    audioTrack,
    videoTrack,
    screenVideoTrack,
    remoteScreenVideoTrack,
    remoteScreenAudioTrack,
    isAudioPublishing,
    isVideoPublishing,
    isScreenSharing,
    isInitialized,
    joined,
    joining,
    showParticipant,
    showBuzzchat,

    // Setters
    setRemoteScreenVideoTrack,
    setRemoteScreenAudioTrack,
    setShowParticipant,
    setShowBuzzchat,

    // Refs
    clientRef,
    screenShareClientRef,
    AgoraRTC,

    // Functions
    updateGlobalParticipants,
    toggleParticipantSidebar,
    toggleChatSidebar,
    startAudio,
    startVideo,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,
    handleLeave,
    handleEndBuzz,
    toggleFullPage,
  };
};
