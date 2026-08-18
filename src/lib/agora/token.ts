import { PostRequest } from "~/utils/new-request";

export type BuzzAgoraTokenRequest = {
  buzz_id: string;
  uid: string | number;
};

export type BuzzAgoraTokenResult = {
  token: string;
  uid: string | number;
  app_id?: string;
  appId?: string;
  [key: string]: unknown;
};

export const getScreenShareBuzzUid = (uid: string | number) => {
  return `screen-${String(uid)}`;
};

export async function getBuzzAgoraToken(
  payload: BuzzAgoraTokenRequest
): Promise<BuzzAgoraTokenResult> {
  const response = await PostRequest("/buzz/token", payload);

  if (!response || response.status < 200 || response.status >= 300) {
    const message =
      response?.response?.data?.message || "Failed to fetch buzz token";
    throw new Error(message);
  }

  const data = response?.data?.data || response?.data;

  if (!data?.token || data?.uid === undefined || data?.uid === null) {
    throw new Error("Buzz token response is missing required fields");
  }

  return data;
}
