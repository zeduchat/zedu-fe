import type {
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";

export interface RemoteUser {
  uid: string | number;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
  hasVideo: boolean;
  hasAudio: boolean;
}

export interface AgoraUser {
  uid: string | number;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
  hasVideo: boolean;
  hasAudio: boolean;
  isScreenShare?: boolean;
}

export interface LocalTracks {
  videoTrack: ICameraVideoTrack | null;
  audioTrack: IMicrophoneAudioTrack | null;
  screenTrack: ILocalVideoTrack | null;
  screenAudioTrack: ILocalAudioTrack | null;
}
