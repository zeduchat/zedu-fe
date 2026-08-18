export const AGORA_CONFIG = {
  appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || "",
};

export async function getAgoraToken(
  channelName: string,
  uid?: number | string
) {
  try {
    const response = await fetch("/api/agora/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName, uid }),
    });

    if (!response.ok) throw new Error("Failed to fetch token");
    return await response.json();
  } catch (error) {
    console.error("Error fetching Agora token:", error);
    throw error;
  }
}
