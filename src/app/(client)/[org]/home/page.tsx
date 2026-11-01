"use client";

import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { DataContext } from "~/store/GlobalState";

export default function HomePage() {
  const router = useRouter();
  const { state } = useContext(DataContext);
  const orgSlug = state?.orgSlug || "demo";

  useEffect(() => {
    router.replace(`/${orgSlug}`);
  }, [router, orgSlug]);

  return null;
}
