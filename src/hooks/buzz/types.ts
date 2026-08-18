import type {
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";

export type Participant = {
  videoTrack?: IRemoteVideoTrack | ILocalVideoTrack | null;
  audioTrack?: ILocalAudioTrack | IRemoteAudioTrack | null;
  uid: number | string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  handsRaised?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  avatar_url?: string;
  user_id?: string;
  isSolo?: boolean;
  join_status?: string;
  color?: string;
};

export type Buzz = {
  buzzId: string;
  channelId: string;
  hostId?: string;
};

export interface BuzzChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  buzzId: string;
  content: string;
  timestamp: number;
}

export interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  name: string;
}
