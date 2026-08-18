"use client";

import React, { useContext, useEffect, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import useFirstChannel from "../../home/channels/hooks/first-channel";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { firstChannel } = useFirstChannel();
  const { state, dispatch } = useContext(DataContext);
  const { id } = useParams();

  useEffect(() => {
    const initializeApp = async () => {
      const orgId = localStorage.getItem("orgId");
      const token = localStorage.getItem("token");

      dispatch({ type: ACTIONS.TOKEN, payload: token });
      dispatch({ type: ACTIONS.ORG_ID, payload: orgId });

      // Construct redirect URL once
      const currentFullUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentFullUrl)}`;

      // 1. Immediate local check
      if (!orgId || !token) {
        // Only redirect if we aren't already on an auth page
        if (!pathname.startsWith("/auth")) {
          router.push(loginUrl);
        }
        setLoading(false);
        return;
      }

      const res = await GetRequest("/profile");
      if (res?.status === 200 || res?.status === 201) {
        dispatch({ type: ACTIONS.USER, payload: res?.data?.data });
      } else {
        // Token might be invalid, redirect to login
        if (!pathname.startsWith("/auth")) {
          router.push(loginUrl);
        }
        return;
      }

      setLoading(false);
      setIsInitialized(true);
    };

    initializeApp();
  }, [dispatch, pathname, searchParams, router, state?.profileCallback]);

  // useEffect(() => {
  //     if (!isInitialized) return;

  //     const handleOrg = async () => {
  //         const orgSlug = localStorage.getItem("orgSlug") || "";

  //         const res = await GetRequest(`/users/switch-org/${orgSlug}`);

  //         if (res?.status === 200 || res?.status === 201) {
  //             localStorage.setItem("token", res?.data?.data?.access_token);
  //             localStorage.setItem("orgId", res?.data?.data?.organisation?.id);
  //             const slug = res.data.data.current_organisation_slug;

  //             dispatch({
  //                 type: ACTIONS.ORG_SLUG,
  //                 payload: slug,
  //             });
  //             dispatch({
  //                 type: ACTIONS.ORG_ID,
  //                 payload: res?.data?.data?.organisation?.id,
  //             });
  //             dispatch({
  //                 type: ACTIONS.ORG_DATA,
  //                 payload: res?.data?.data?.organisation,
  //             });

  //             if (orgSlug) {

  //                 // get the first channel
  //                 const channelId = await firstChannel(res?.data?.data?.organisation?.id);

  //                 if (channelId) {
  //                     window.location.href = `/${slug}/home/channels/${channelId}`;
  //                 } else {
  //                     window.location.href = `/${slug}`;
  //                 }
  //             }

  //             localStorage.removeItem("orgSlug");
  //         }
  //     };

  //     if (id) {
  //         handleOrg();
  //     }
  // }, [id, isInitialized])

  if (loading) return null;

  return <>{children}</>;
};

export default AuthGuard;
