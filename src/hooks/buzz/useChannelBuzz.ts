import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { useAgoraClient } from "~/hooks/buzz";
import { updateRecordingLayout } from "~/lib/buzz/update-recording-layout";
import { captureAndDispatchLocalUintUid } from "~/lib/buzz/agora-uint-uid";
import {
  createPlaceholderTrackSession,
  destroyPlaceholderTrackSession,
  isRecordingPlaceholderTrack,
  type PlaceholderTrackSession,
} from "~/lib/buzz/recording-placeholder-track";
import { PostRequest } from "~/utils/new-request";
import { showError, showInfo } from "~/components/toast/sonner";
import type {
  IAgoraRTC,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";
import { getBuzzAgoraToken } from "~/lib/agora/token";

// Configuration options for useBuzz hook
export interface UseBuzzOptions {
  skipJoin?: boolean;
  skipMedia?: boolean;
  skipRemoteMute?: boolean;
  minimalMode?: boolean;
  disableEffects?: boolean;
}

export const useChannelBuzz = (options: UseBuzzOptions = {}) => {
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
    buzzAgoraUintUids,
  } = state;

  const clientRef = useAgoraClient();
  const screenShareClientRef = useAgoraClient();
  const isJoiningInProgress = useRef(false);
  const isScreenShareJoiningInProgress = useRef(false);
  const joinedScreenChannelRef = useRef<string | null>(null);
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
  const [joined, setJoined] = useState<boolean>(false);
  const [joining, setJoining] = useState<boolean>(false);

  // UI states
  const [showParticipant, setShowParticipant] = useState(false);
  const [showBuzzchat, setShowBuzzchat] = useState(false);

  const placeholderSessionRef = useRef<PlaceholderTrackSession | null>(null);
  const placeholderPublishInFlightRef = useRef(false);
  const cameraPublishInFlightRef = useRef(false);
  const handledRemoteMuteRef = useRef(false);
  const buzzParticipantsRef = useRef(buzzParticipants);

  useEffect(() => {
    buzzParticipantsRef.current = buzzParticipants;
  }, [buzzParticipants]);

  const getScreenShareAccount = useCallback((uid: number | string) => {
    return `screen-${String(uid)}`;
  }, []);

  // Helper function to update participants in global state
  const updateGlobalParticipants = useCallback(
    (updateFn: (participants: any[]) => any[]) => {
      const updatedParticipants = updateFn(buzzParticipantsRef.current || []);
      buzzParticipantsRef.current = updatedParticipants;
      dispatch({
        type: ACTIONS.BUZZ_PARTICIPANTS,
        payload: updatedParticipants,
      });
    },
    [dispatch]
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

  const resetScreenShareClient = useCallback(async () => {
    const screenClient = screenShareClientRef.current;

    joinedScreenChannelRef.current = null;
    isScreenShareJoiningInProgress.current = false;

    if (!screenClient || screenClient.connectionState === "DISCONNECTED") {
      return;
    }

    try {
      await screenClient.leave();
    } catch (error) {
      console.warn("Failed to leave screen share client cleanly", error);
    }
  }, [screenShareClientRef]);

  const ensureScreenShareClientJoined = useCallback(
    async (appId: string, buzzId: string, uid: number | string) => {
      const screenClient = screenShareClientRef.current;
      const channelName = buzzId;

      if (!screenClient) {
        throw new Error("Screen share client is not initialized yet");
      }

      if (
        screenClient.connectionState === "CONNECTED" &&
        joinedScreenChannelRef.current === channelName
      ) {
        return;
      }

      if (isScreenShareJoiningInProgress.current) {
        return;
      }

      isScreenShareJoiningInProgress.current = true;

      try {
        if (screenClient.connectionState !== "DISCONNECTED") {
          await resetScreenShareClient();
        }

        const payload = {
          buzz_id: channelName,
          uid: getScreenShareAccount(uid),
        };

        const { token: sToken, uid: sUid } = await getBuzzAgoraToken(payload);
        await screenClient.join(appId, channelName, sToken, sUid);
        joinedScreenChannelRef.current = channelName;
      } finally {
        isScreenShareJoiningInProgress.current = false;
      }
    },
    [screenShareClientRef, getScreenShareAccount, resetScreenShareClient]
  );

  const subscribeExistingScreenShareUsers = useCallback(async () => {
    const screenClient = screenShareClientRef.current;
    if (!screenClient) return;

    for (const remoteUser of screenClient.remoteUsers) {
      if (!String(remoteUser.uid).startsWith("screen-")) continue;

      try {
        if (remoteUser.hasVideo) {
          await screenClient.subscribe(remoteUser, "video");
          setRemoteScreenVideoTrack(remoteUser.videoTrack ?? null);
        }

        if (remoteUser.hasAudio) {
          await screenClient.subscribe(remoteUser, "audio");
          setRemoteScreenAudioTrack(remoteUser.audioTrack ?? null);
          remoteUser.audioTrack?.stop();
          remoteUser.audioTrack?.play();
        }
      } catch (error) {
        console.warn(
          "Failed to subscribe to existing screen share user",
          error
        );
      }
    }
  }, [screenShareClientRef]);

  const unpublishAllLocalVideoTracks = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    for (const track of [...client.localTracks]) {
      if (track.getMediaStreamTrack?.().kind !== "video") continue;
      try {
        await client.unpublish(track);
      } catch (error) {
        console.warn("Failed to unpublish local video track", error);
      }
    }
  }, [clientRef]);

  const stopPlaceholder = useCallback(async () => {
    const client = clientRef.current;
    const session = placeholderSessionRef.current;

    if (session) {
      try {
        if (client) {
          await client.unpublish(session.track);
        }
      } catch (error) {
        console.warn("Failed to unpublish placeholder track", error);
      }

      destroyPlaceholderTrackSession(session);
      placeholderSessionRef.current = null;
    }

    await unpublishAllLocalVideoTracks();

    if (user?.user_id) {
      updateGlobalParticipants((prev) =>
        prev.map((participant) =>
          participant.user_id === user.user_id
            ? { ...participant, videoTrack: null }
            : participant
        )
      );
    }
  }, [
    clientRef,
    user?.user_id,
    updateGlobalParticipants,
    unpublishAllLocalVideoTracks,
  ]);

  const startPlaceholder = useCallback(async () => {
    if (skipMedia || !joined || !buzzData?.is_recording) return;
    if (!clientRef.current || !AgoraRTC.current || !user?.user_id) return;
    if (clientRef.current.connectionState !== "CONNECTED") return;
    if (isVideoPublishing || placeholderSessionRef.current) return;
    if (
      placeholderPublishInFlightRef.current ||
      cameraPublishInFlightRef.current
    )
      return;

    placeholderPublishInFlightRef.current = true;

    try {
      await unpublishAllLocalVideoTracks();

      const localParticipant = buzzParticipants?.find(
        (participant: { user_id?: string }) =>
          participant.user_id === user.user_id
      );

      updateGlobalParticipants((prev) =>
        prev.map((participant) =>
          participant.user_id === user.user_id
            ? { ...participant, videoTrack: null }
            : participant
        )
      );

      const session = await createPlaceholderTrackSession(AgoraRTC.current, {
        name:
          user.username ||
          user.display_name ||
          user.first_name ||
          localParticipant?.username ||
          "You",
        avatarUrl: user.avatar_url || localParticipant?.avatar_url,
        color: localParticipant?.color,
      });

      await clientRef.current.publish(session.track);
      placeholderSessionRef.current = session;

      await captureAndDispatchLocalUintUid(
        clientRef.current,
        session.track,
        dispatch
      );
    } catch (error) {
      console.error("Failed to start placeholder video track:", error);
      destroyPlaceholderTrackSession(placeholderSessionRef.current);
      placeholderSessionRef.current = null;
    } finally {
      placeholderPublishInFlightRef.current = false;
    }
  }, [
    skipMedia,
    joined,
    buzzData?.is_recording,
    clientRef,
    user,
    isVideoPublishing,
    buzzParticipants,
    unpublishAllLocalVideoTracks,
    dispatch,
    updateGlobalParticipants,
  ]);

  const stopCamera = useCallback(async () => {
    if (!videoTrack || !clientRef.current) return;

    try {
      await clientRef.current.unpublish(videoTrack);
    } catch (error) {
      console.warn("Failed to unpublish camera track", error);
    }

    videoTrack.stop();
    videoTrack.close();
    setVideoTrack(null);
    setIsVideoPublishing(false);

    updateGlobalParticipants((prev) =>
      prev.map((participant) =>
        participant.user_id === user?.user_id
          ? { ...participant, videoTrack: null }
          : participant
      )
    );
  }, [videoTrack, clientRef, user?.user_id, updateGlobalParticipants]);

  // Start audio track and publish to channel
  const startAudio = useCallback(async () => {
    if (skipMedia) return;
    if (
      !clientRef.current ||
      !AgoraRTC.current ||
      !joined ||
      audioTrack ||
      !user ||
      !buzzData
    )
      return;
    if (clientRef.current.connectionState !== "CONNECTED") {
      showInfo("Still connecting to buzz. Please try again in a moment.");
      return;
    }

    try {
      // Set audio encoderConfig to 'music_standard' for ~48kbps quality and to avoid bitrate warnings
      const track = await AgoraRTC.current.createMicrophoneAudioTrack({
        encoderConfig: "music_standard",
      });
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
    if (skipMedia) return;
    if (cameraPublishInFlightRef.current) return;

    if (!clientRef.current || !AgoraRTC.current || !joined || !user?.user_id)
      return;
    if (clientRef.current.connectionState !== "CONNECTED") {
      showInfo("Still connecting to buzz. Please try again in a moment.");
      return;
    }

    cameraPublishInFlightRef.current = true;

    try {
      await stopPlaceholder();
      await unpublishAllLocalVideoTracks();

      await new Promise((resolve) => setTimeout(resolve, 500));

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

      await clientRef.current.publish(track);
      setVideoTrack(track);
      setIsVideoPublishing(true);

      await captureAndDispatchLocalUintUid(clientRef.current, track, dispatch);

      updateGlobalParticipants((prev) =>
        prev.map((participant) =>
          participant.user_id === user.user_id
            ? { ...participant, videoTrack: track }
            : participant
        )
      );
    } catch (e) {
      console.error("Failed to start video:", e);

      const message = e instanceof Error ? e.message : String(e);
      const normalized = message.toUpperCase();

      if (normalized.includes("CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS")) {
        try {
          await unpublishAllLocalVideoTracks();
          await stopPlaceholder();
        } catch (cleanupError) {
          console.warn(
            "Failed to clear video tracks before retry",
            cleanupError
          );
        }
        showError(
          "Camera is still switching from recording mode. Please try again."
        );
      } else if (
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
    } finally {
      cameraPublishInFlightRef.current = false;
    }
  }, [
    skipMedia,
    clientRef,
    joined,
    user,
    stopPlaceholder,
    unpublishAllLocalVideoTracks,
    dispatch,
    updateGlobalParticipants,
  ]);

  // Toggle audio on/off
  const toggleAudio = useCallback(async () => {
    if (!audioTrack) {
      await startAudio();
      return;
    }

    try {
      const newState = !isAudioPublishing;
      await audioTrack.setMuted(!newState);
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

  const toggleVideo = useCallback(async () => {
    if (isVideoPublishing) {
      if (buzzData?.is_recording) {
        try {
          await stopCamera();
          await startPlaceholder();
        } catch (e) {
          console.error("Toggle video failed", e);
        }
        return;
      }

      if (!videoTrack) return;

      try {
        await videoTrack.setEnabled(false);
        setIsVideoPublishing(false);
        updateGlobalParticipants((prev) =>
          prev.map((participant) =>
            participant.user_id === user?.user_id
              ? { ...participant, videoTrack: null }
              : participant
          )
        );
      } catch (e) {
        console.error("Toggle video failed", e);
      }
      return;
    }

    if (videoTrack && !buzzData?.is_recording) {
      try {
        await videoTrack.setEnabled(true);
        setIsVideoPublishing(true);
        updateGlobalParticipants((prev) =>
          prev.map((participant) =>
            participant.user_id === user?.user_id
              ? { ...participant, videoTrack }
              : participant
          )
        );
      } catch (e) {
        console.error("Toggle video failed", e);
      }
      return;
    }

    try {
      await startVideo();
    } catch (e) {
      console.error("Toggle video failed", e);
    }
  }, [
    isVideoPublishing,
    buzzData?.is_recording,
    videoTrack,
    stopCamera,
    startPlaceholder,
    startVideo,
    user?.user_id,
    updateGlobalParticipants,
  ]);

  const syncRecordingScreenShareLayout = useCallback(
    async (screenTrack?: ILocalVideoTrack | null) => {
      if (!buzzData?.is_recording || !buzzData.buzz_id) return;

      const track = screenTrack ?? screenVideoTrack;
      const screenClient = screenShareClientRef.current;
      if (!track || !screenClient) return;

      const screenShareUintUid =
        (await captureAndDispatchLocalUintUid(screenClient, track, dispatch, {
          isScreenShare: true,
        })) ?? buzzAgoraUintUids?.screenShareUintUid;

      if (!screenShareUintUid) {
        console.warn("Screen share uint uid not ready for recording layout");
        return;
      }

      const includeCameraPiP = isVideoPublishing;

      let cameraUintUid = includeCameraPiP
        ? buzzAgoraUintUids?.cameraUintUid
        : undefined;

      if (includeCameraPiP && videoTrack && clientRef.current) {
        cameraUintUid =
          (await captureAndDispatchLocalUintUid(
            clientRef.current,
            videoTrack,
            dispatch
          )) ?? cameraUintUid;
      }

      await updateRecordingLayout(
        buzzData.buzz_id,
        screenShareUintUid,
        cameraUintUid,
        includeCameraPiP
      );
    },
    [
      buzzData?.is_recording,
      buzzData?.buzz_id,
      screenVideoTrack,
      screenShareClientRef,
      buzzAgoraUintUids,
      isVideoPublishing,
      videoTrack,
      clientRef,
      dispatch,
    ]
  );

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (skipMedia) return;
    if (screenVideoTrack) {
      await screenShareClientRef?.current?.unpublish(screenVideoTrack);
      screenVideoTrack.stop();
      screenVideoTrack.close();
      setScreenVideoTrack(null);
      setIsScreenSharing(false);
      dispatch({ type: ACTIONS.BUZZ_IS_SCREEN_SHARING, payload: false });
    } else {
      if (
        !buzzData?.buzz_id ||
        !buzzData?.agora_token?.app_id ||
        !buzzData?.agora_token?.uid
      ) {
        showError("Unable to start screen sharing right now.");
        return;
      }

      const track = await AgoraRTC.current?.createScreenVideoTrack({}, "auto");
      if (!track) return;
      const vTrack = Array.isArray(track) ? track[0] : track;
      if (screenShareClientRef.current && vTrack) {
        await ensureScreenShareClientJoined(
          buzzData.agora_token.app_id,
          buzzData.buzz_id,
          buzzData.agora_token.uid
        );
        await screenShareClientRef.current.publish(vTrack);
        setScreenVideoTrack(vTrack);
        setIsScreenSharing(true);
        dispatch({ type: ACTIONS.BUZZ_IS_SCREEN_SHARING, payload: true });

        if (buzzData?.is_recording) {
          await syncRecordingScreenShareLayout(vTrack);
        }
      }
    }
  }, [
    screenVideoTrack,
    screenShareClientRef,
    buzzData,
    ensureScreenShareClientJoined,
    dispatch,
    syncRecordingScreenShareLayout,
  ]);

  // Toggle hand raise status
  const toggleHandRaise = useCallback(async () => {
    if (skipMedia) return;
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
      if (buzzData?.is_recording && currentBuzzId) {
        await PostRequest(`/buzz/${currentBuzzId}/recording/stop`, {});
        dispatch({
          type: ACTIONS.BUZZ_DATA,
          payload: { ...buzzData, is_recording: false },
        });
      }

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
      destroyPlaceholderTrackSession(placeholderSessionRef.current);
      placeholderSessionRef.current = null;

      setVideoTrack(null);
      setAudioTrack(null);
      setScreenVideoTrack(null);
      setRemoteScreenVideoTrack(null);
      setRemoteScreenAudioTrack(null);
      setIsVideoPublishing(false);
      setIsAudioPublishing(false);
      setIsScreenSharing(false);
      dispatch({ type: ACTIONS.BUZZ_IS_SCREEN_SHARING, payload: false });
      setJoined(false);
      setJoining(true);
      isJoiningInProgress.current = false;

      dispatch({
        type: ACTIONS.BUZZ_PARTICIPANTS,
        payload: (buzzParticipants || [])
          .filter(
            (participant: any) =>
              String(participant?.user_id) !== String(user?.user_id)
          )
          .map((participant: any) => ({
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
      await resetScreenShareClient();
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
    buzzData,
    videoTrack,
    audioTrack,
    screenVideoTrack,
    dispatch,
    buzzParticipants,
    resetScreenShareClient,
    user?.user_id,
  ]);

  // End the buzz call for all participants
  const handleEndBuzz = useCallback(async () => {
    const currentBuzzId = buzzData?.buzz_id;

    try {
      if (buzzData?.is_recording && currentBuzzId) {
        await PostRequest(`/buzz/${currentBuzzId}/recording/stop`, {});
        dispatch({
          type: ACTIONS.BUZZ_DATA,
          payload: { ...buzzData, is_recording: false },
        });
      }

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
      destroyPlaceholderTrackSession(placeholderSessionRef.current);
      placeholderSessionRef.current = null;

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
      await resetScreenShareClient();
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
    buzzData,
    videoTrack,
    audioTrack,
    screenVideoTrack,
    dispatch,
    buzzParticipants,
    resetScreenShareClient,
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

    if (typeof window !== "undefined" && !AgoraRTC.current) {
      import("agora-rtc-sdk-ng").then((mod) => {
        AgoraRTC.current = mod.default;
        setIsInitialized(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!hasJoined) {
      setJoined(false);
      setJoining(false);
      isJoiningInProgress.current = false;
    }
  }, [hasJoined]);

  useEffect(() => {
    const joinChannel = async () => {
      if (joined || !hasJoined || !user || isJoiningInProgress.current) return;

      const hasValidBuzzData =
        buzzData &&
        typeof buzzData === "object" &&
        !Array.isArray(buzzData) &&
        buzzData.buzz_id &&
        buzzData.agora_token;

      if (!isInitialized || !hasValidBuzzData) {
        if (hasJoined && !joined) {
          setJoining(true);
        }
        return;
      }

      try {
        isJoiningInProgress.current = true;
        setJoining(true);
        let didJoinAgora = false;

        const { buzz_id, agora_token } = buzzData;
        const { uid, token, app_id } = agora_token;

        if (!clientRef.current) {
          throw new Error("Agora client is not initialized yet");
        }

        if (clientRef.current.connectionState === "CONNECTED") {
          didJoinAgora = true;
        }

        if (
          clientRef.current &&
          clientRef.current.connectionState === "DISCONNECTED"
        ) {
          await clientRef.current.join(app_id, buzz_id, token, uid);
          didJoinAgora = true;

          clientRef.current.remoteUsers.forEach(async (remoteUser) => {
            if (remoteUser.hasAudio) {
              await clientRef.current?.subscribe(remoteUser, "audio");
              remoteUser.audioTrack?.stop();
              remoteUser.audioTrack?.play();
            }

            let remoteVideoTrack = remoteUser.videoTrack ?? null;
            if (remoteUser.hasVideo) {
              await clientRef.current?.subscribe(remoteUser, "video");
              if (isRecordingPlaceholderTrack(remoteUser.videoTrack)) {
                await clientRef.current?.unsubscribe(remoteUser, "video");
                remoteVideoTrack = null;
              } else {
                remoteVideoTrack = remoteUser.videoTrack ?? null;
              }
            }

            updateGlobalParticipants((prev) =>
              prev.map((p) => {
                const isSameParticipant =
                  String(p.uid) === String(remoteUser.uid) ||
                  String(p.user_id) === String(remoteUser.uid);

                return isSameParticipant
                  ? {
                      ...p,
                      uid: p.uid ?? remoteUser.uid,
                      videoTrack: remoteVideoTrack || p.videoTrack,
                      audioTrack: remoteUser.audioTrack || p.audioTrack,
                    }
                  : p;
              })
            );
          });
        }

        if (screenShareClientRef.current) {
          try {
            await ensureScreenShareClientJoined(app_id, buzz_id, uid);
            await subscribeExistingScreenShareUsers();
          } catch (screenJoinError) {
            console.warn(
              "Screen share receive client failed to join",
              screenJoinError
            );
          }
        }

        if (!didJoinAgora) {
          throw new Error("Agora join did not complete");
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
        dispatch({ type: ACTIONS.HAS_JOINED, payload: false });
        dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: false });
      }
    };

    if (hasJoined) {
      joinChannel();
    }
  }, [
    isInitialized,
    joined,
    user,
    dispatch,
    hasJoined,
    buzzData,
    clientRef,
    screenShareClientRef,
    ensureScreenShareClientJoined,
    subscribeExistingScreenShareUsers,
    updateGlobalParticipants,
  ]);

  useEffect(() => {
    if (skipMedia || !joined) return;

    const isRecording = Boolean(buzzData?.is_recording);

    if (
      isRecording &&
      !isVideoPublishing &&
      !placeholderSessionRef.current &&
      !placeholderPublishInFlightRef.current &&
      !cameraPublishInFlightRef.current
    ) {
      void startPlaceholder();
      return;
    }

    if (!isRecording && placeholderSessionRef.current) {
      void stopPlaceholder();
    }
  }, [
    buzzData?.is_recording,
    skipMedia,
    joined,
    isVideoPublishing,
    startPlaceholder,
    stopPlaceholder,
  ]);

  useEffect(() => {
    if (skipMedia || !joined) return;
    if (!buzzData?.is_recording || !isScreenSharing || !screenVideoTrack)
      return;

    void syncRecordingScreenShareLayout(screenVideoTrack);
  }, [
    buzzData?.is_recording,
    isScreenSharing,
    screenVideoTrack,
    isVideoPublishing,
    skipMedia,
    joined,
    syncRecordingScreenShareLayout,
  ]);

  //   Handle remote mute from host
  useEffect(() => {
    // Skip if in minimal mode or remote mute is disabled
    if (effectsDisabled || skipRemoteMute || !joined) return;

    const isHost = String(buzzData?.host_id) === String(user?.user_id);
    if (isHost) return;

    if (!muteParticipant) {
      handledRemoteMuteRef.current = false;
      return;
    }

    if (handledRemoteMuteRef.current || !audioTrack) return;

    const handleRemoteMute = async () => {
      try {
        await audioTrack.setMuted(true);
        setIsAudioPublishing(false);

        updateGlobalParticipants((prev) =>
          prev.map((p) =>
            p.user_id === user?.user_id ? { ...p, audioTrack: null } : p
          )
        );

        handledRemoteMuteRef.current = true;
        showInfo("The host has muted all participants");
      } catch (e) {
        console.log("Failed to execute remote mute:", e);
      }
    };

    void handleRemoteMute();
  }, [
    effectsDisabled,
    skipRemoteMute,
    muteParticipant,
    joined,
    audioTrack,
    buzzData?.host_id,
    user?.user_id,
    updateGlobalParticipants,
  ]);

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
