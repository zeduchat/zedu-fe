"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { bootstrapOrganisationAccess } from "~/utils/org-access-api";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import { usePathname, useRouter } from "next/navigation";
import Topbar from "~/components/layout/topbar";
import { ChannelBuzzProvider } from "~/hooks/buzz/ChannelBuzzContext";
import {
  RECORDER_SESSION_MODE,
  isStandaloneBuzzRoute,
  isRecorderRoute,
  isBuzzDetailsRoute,
} from "~/lib/buzz/session";
import SideBar from "~/components/layout/sidebar";
import UserSidebar from "./_components/profile-sidebar/user-sidebar";
import { TooltipProvider } from "~/components/ui/tooltip";
import { UploadProvider } from "~/store/UploadContext";
import UploadProgressPopover from "./_components/file-management/UploadProgressPopover";
import OneSignalProvider from "~/components/layout/onesignal/onesignal-provider";
import OneSignalSubscriptionSync from "~/components/layout/onesignal/onesignal-subscription";
import { NotificationBanner } from "./_components/notification-banner";
import IncomingCallPopupContainer from "~/app/(client)/[org]/_components/buzz-management/IncomingCallPopupContainer";
import StatusConnection from "~/components/layout/centrifugo/status-connection";
import ChatBuzzSidePanel from "./_components/buzz-management/chatBuzzSidePanel";
import GeneralNotificationConnection from "~/components/layout/centrifugo/general-notification-connection";
import ChatAgoraConnection from "~/components/layout/centrifugo/chat-agora-connection";
import ChannelAgoraConnection from "~/components/layout/centrifugo/channel-agora-connection";
import useFirstChannel from "./home/channels/hooks/first-channel";
import {
  redirectAfterOrgSwitch,
  resolveChannelIdForOrgSwitch,
} from "~/utils/org-switch";

const ClientLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const segments = pathname.split("/");
  const slug = segments[1];
  const { firstChannel } = useFirstChannel();

  useEffect(() => {
    if (
      prevPathnameRef.current !== null &&
      prevPathnameRef.current !== pathname
    ) {
      dispatch({ type: ACTIONS.REPLY, payload: false });
      dispatch({ type: ACTIONS.IS_EDIT_REPLY, payload: false });
      dispatch({ type: ACTIONS.LOAD_THREAD, payload: !state.loadThread });
    }

    prevPathnameRef.current = pathname;
  }, [pathname, dispatch]);

  useEffect(() => {
    let cancelled = false;

    const storedSlug =
      localStorage.getItem("orgSlug") ||
      state.orgSlug ||
      state.orgData?.organisation_slug ||
      "";

    const finish = () => {
      if (cancelled) return;
      setLoading(false);
      setIsInitialized(true);
    };

    const syncOrgFromSlug = async (targetSlug: string) => {
      const response = await GetRequest(`/users/switch-org/${targetSlug}`);
      if (cancelled) return null;

      const status = response?.status ?? response?.response?.status;
      const data = response?.data?.data ?? response?.response?.data?.data;

      if (status === 200 || status === 201) {
        const nextSlug = data?.current_organisation_slug ?? targetSlug;
        const nextOrgId = data?.organisation?.id;

        localStorage.setItem("token", data?.access_token);
        localStorage.setItem("orgId", nextOrgId);
        localStorage.setItem("orgSlug", nextSlug);

        return nextSlug;
      }

      return null;
    };

    if (slug === "client") {
      dispatch({
        type: ACTIONS.ORG_SLUG,
        payload: "client",
      });
      finish();
      return () => {
        cancelled = true;
      };
    }

    // No usable URL slug — stay put.
    if (!slug || slug === "undefined") {
      finish();
      return () => {
        cancelled = true;
      };
    }

    // Buzz join links: always honour the org slug in the URL and never send users to /404.
    // Org switch is best-effort so Green Room can load; buzz APIs enforce access.
    if (isBuzzDetailsRoute(pathname)) {
      localStorage.setItem("orgSlug", slug);
      if (state.orgSlug !== slug) {
        dispatch({ type: ACTIONS.ORG_SLUG, payload: slug });
      }

      const runBuzzOrgSync = async () => {
        if (storedSlug && slug === storedSlug) {
          finish();
          return;
        }

        const nextSlug = await syncOrgFromSlug(slug);
        if (cancelled) return;

        if (nextSlug) {
          redirectAfterOrgSwitch(nextSlug, null, { preservePath: true });
          return;
        }

        finish();
      };

      void runBuzzOrgSync();

      return () => {
        cancelled = true;
      };
    }

    if (storedSlug && slug === storedSlug) {
      if (!localStorage.getItem("orgSlug")) {
        localStorage.setItem("orgSlug", slug);
      }
      if (state.orgSlug !== slug) {
        dispatch({ type: ACTIONS.ORG_SLUG, payload: slug });
      }
      finish();
      return () => {
        cancelled = true;
      };
    }

    if (!storedSlug) {
      localStorage.setItem("orgSlug", slug);
      dispatch({ type: ACTIONS.ORG_SLUG, payload: slug });
      finish();
      return () => {
        cancelled = true;
      };
    }

    // Genuine org switch: URL slug differs from the session org.
    const handleCheckSlug = async () => {
      const response = await GetRequest(`/users/switch-org/${slug}`);
      if (cancelled) return;

      const status = response?.status ?? response?.response?.status;
      const data = response?.data?.data ?? response?.response?.data?.data;

      if (status === 200 || status === 201) {
        const nextSlug = data?.current_organisation_slug;
        const nextOrgId = data?.organisation?.id;

        localStorage.setItem("token", data?.access_token);
        localStorage.setItem("orgId", nextOrgId);
        localStorage.setItem("orgSlug", nextSlug);

        const channelId = await resolveChannelIdForOrgSwitch(
          firstChannel,
          nextOrgId
        );

        redirectAfterOrgSwitch(nextSlug, channelId);
        return;
      } else if (status === 404 || status === 400) {
        router.push("/404");
      }

      finish();
    };

    void handleCheckSlug();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router, slug, pathname]);

  // get all users in an organisation
  useEffect(() => {
    const orgId = localStorage.getItem("orgId");

    const getOrganisationUsers = async () => {
      const response = await GetRequest(
        `/organisations/${orgId}/users?page=1&limit=500`
      );

      if (response?.status === 200 || response?.status === 201) {
        dispatch({ type: ACTIONS.ORG_MEMBERS, payload: response?.data?.data });
      }
    };

    const getOrganisationInvites = async () => {
      const response = await GetRequest(`/organisations/${orgId}/invites`);
      if (response?.status === 200 || response?.status === 201) {
        const result = response.data.data.filter(
          (item: any) => item.status === "invited"
        );
        dispatch({ type: ACTIONS.ORG_INVITES, payload: result });
      }
    };

    const loadOrganisationAccess = async () => {
      if (!orgId) return;
      dispatch({ type: ACTIONS.ORG_ACCESS_LOADING, payload: true });
      try {
        const { permissions, roles } = await bootstrapOrganisationAccess(orgId);
        dispatch({ type: ACTIONS.PERMISSIONS_CATALOG, payload: permissions });
        dispatch({ type: ACTIONS.ORG_ROLES, payload: roles });
      } catch (error) {
        console.error("Failed to load organisation access data:", error);
      } finally {
        dispatch({ type: ACTIONS.ORG_ACCESS_LOADING, payload: false });
      }
    };

    if (isInitialized) {
      getOrganisationUsers();
      getOrganisationInvites();
      loadOrganisationAccess();
    }
  }, [dispatch, state.orgCallback, isInitialized]);

  const { buzzSidebar, buzzView, isChatOpen, buzzSessionMode } = state;
  // Calculate width for the right panel container
  let totalSidePanelWidth = 0;
  const shouldShowBuzzSidePanel =
    buzzSidebar && (buzzView === "side" || buzzView === "full");
  if (shouldShowBuzzSidePanel) {
    totalSidePanelWidth += isChatOpen ? 820 : 440;
  }

  const isBuzzDetailsScreen = isStandaloneBuzzRoute(pathname);

  const isRecorderSession =
    isRecorderRoute(pathname) || buzzSessionMode === RECORDER_SESSION_MODE;

  const isStandaloneBuzzSession = isBuzzDetailsScreen;

  const channelBuzzOptions =
    buzzSessionMode === RECORDER_SESSION_MODE
      ? { skipMedia: true, skipRemoteMute: true, minimalMode: true }
      : undefined;

  if (loading) return null;

  if (isStandaloneBuzzSession) {
    return (
      <UploadProvider>
        <TooltipProvider>
          <OneSignalProvider />
          <OneSignalSubscriptionSync />
          <ChannelBuzzProvider options={channelBuzzOptions}>
            {children}
          </ChannelBuzzProvider>
        </TooltipProvider>
      </UploadProvider>
    );
  }

  return (
    <UploadProvider>
      {!isRecorderSession && (
        <>
          <GeneralNotificationConnection />
          <ChatAgoraConnection />
          <ChannelAgoraConnection />
        </>
      )}
      <TooltipProvider>
        <OneSignalProvider />
        <OneSignalSubscriptionSync />
        {!isRecorderSession && <StatusConnection />}

        <ChannelBuzzProvider options={channelBuzzOptions}>
          <Topbar />
          <div className="w-full flex relative">
            <SideBar />
            <div className={`w-full relative`}>
              {children}
              <UserSidebar />
            </div>
            {/* Central ChatBuzzSidePanel, excluded on buzz details screen */}
            {!isBuzzDetailsScreen && shouldShowBuzzSidePanel && (
              <div
                className={`fixed mt-[60px] right-0 top-0 h-full flex transition-all duration-300 ease-in-out z-[9999]`}
                style={{ width: isChatOpen ? 820 : 440 }}
              >
                <div
                  className={`${buzzView === "full" ? "fixed inset-0 z-[98]" : "relative w-[440px]"} h-full bg-white border-l border-[#E6EAEF]`}
                >
                  <ChatBuzzSidePanel onClose={() => {}} />
                </div>
              </div>
            )}
          </div>
        </ChannelBuzzProvider>
        <UploadProgressPopover />
        <NotificationBanner />
        <IncomingCallPopupContainer />
      </TooltipProvider>
    </UploadProvider>
  );
};

export default ClientLayout;
