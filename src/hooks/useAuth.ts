import { useRouter } from "next/navigation";
import { useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";

export const useAuth = () => {
  const router = useRouter();
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  const isAuthenticated = (): boolean => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    return !!token;
  };

  const redirectToAuth = (coworkerId?: string) => {
    const currentPath = window.location.pathname;
    const authUrl = coworkerId
      ? `/auth/login?redirect=${encodeURIComponent(currentPath)}&coworkerId=${coworkerId}`
      : `/auth/login?redirect=${encodeURIComponent(currentPath)}`;

    router.push(authUrl);
  };

  const navigateToAgentChat = async (
    coworkerId: string,
    coworkerName: string
  ) => {
    try {
      const orgId = localStorage.getItem("orgId") || "";

      // Create a DM channel with the agent
      const payload = {
        chat_type: "bot",
        participant_id: coworkerId,
      };

      // Store agent name for the channel
      localStorage.setItem("channelName", coworkerName);

      const res = await PostRequest(`/organisations/${orgId}/dms`, payload);

      if (res?.status === 200 || res?.status === 201) {
        // Navigate to the agent chat page
        router.push(
          `/${orgSlug}/home/agents/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}`
        );
      } else {
        // If DM creation fails, fallback to browse agents page
        router.push(`/${orgSlug}/home/colleagues/${coworkerId}`);
      }
    } catch (error) {
      console.error("Error navigating to agent:", error);
      // Fallback to browse agents page on error
      router.push(`/${orgSlug}/agents/browse-agents/${coworkerId}`);
    }
  };

  const handleAddToTeam = async (coworkerId: string, coworkerName: string) => {
    if (!isAuthenticated()) {
      redirectToAuth(coworkerId);
      return;
    }

    // If authenticated, navigate to chat with the agent
    await navigateToAgentChat(coworkerId, coworkerName);
  };

  return {
    isAuthenticated,
    redirectToAuth,
    navigateToAgentChat,
    handleAddToTeam,
  };
};
