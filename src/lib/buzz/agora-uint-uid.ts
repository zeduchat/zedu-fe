import type { Dispatch } from "react";
import type { IAgoraRTCClient, ILocalVideoTrack } from "agora-rtc-sdk-ng";
import { ACTIONS } from "~/store/Actions";

type AgoraUidCarrier = { _uintid?: number };

export function readAgoraUintUid(
  client: IAgoraRTCClient | null | undefined,
  track?: ILocalVideoTrack | null
): number | undefined {
  if (track) {
    const fromTrack = (track as AgoraUidCarrier)._uintid;
    if (typeof fromTrack === "number") return fromTrack;
  }

  if (client && track) {
    for (const localTrack of client.localTracks) {
      if (localTrack === track) {
        const fromLocal = (localTrack as AgoraUidCarrier)._uintid;
        if (typeof fromLocal === "number") return fromLocal;
      }
    }
  }

  const fromClient = client ? (client as AgoraUidCarrier)._uintid : undefined;
  if (typeof fromClient === "number") return fromClient;

  return undefined;
}

export async function captureAndDispatchLocalUintUid(
  client: IAgoraRTCClient,
  track: ILocalVideoTrack,
  dispatch: Dispatch<{ type: string; payload: unknown }>,
  options?: { isScreenShare?: boolean }
): Promise<number | undefined> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const uintUid = readAgoraUintUid(client, track);
    if (typeof uintUid === "number") {
      dispatch({
        type: ACTIONS.BUZZ_AGORA_UINT_UIDS,
        payload: options?.isScreenShare
          ? { screenShareUintUid: uintUid }
          : { cameraUintUid: uintUid },
      });
      return uintUid;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return undefined;
}
