"use client";

import { useContext, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import {
  hydrateRecorderSessionFromSearchParams,
  RECORDER_SESSION_MODE,
} from "~/lib/buzz/session";

interface RecorderRouteBootstrapProps {
  children: React.ReactNode;
}

export function RecorderRouteBootstrap({
  children,
}: RecorderRouteBootstrapProps) {
  const searchParams = useSearchParams();
  const { dispatch } = useContext(DataContext);

  useLayoutEffect(() => {
    const session = hydrateRecorderSessionFromSearchParams(searchParams);

    if (session.isRecorder) {
      dispatch({
        type: ACTIONS.BUZZ_SESSION_MODE,
        payload: RECORDER_SESSION_MODE,
      });
    }
  }, [dispatch, searchParams]);

  return children;
}
