"use client";

import { useEffect } from "react";
import { setupAxiosAuthInterceptor } from "~/utils/auth-session";

export default function AuthSessionSetup() {
  useEffect(() => {
    setupAxiosAuthInterceptor();
  }, []);

  return null;
}
