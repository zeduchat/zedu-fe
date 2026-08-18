"use client";
import { Toaster } from "sonner";
import { ReactNode, useEffect } from "react";
// import { useVisitTracker } from "~/hooks/useVisitTracker";

export default function ClientLayout({ children }: { children: ReactNode }) {
  // useVisitTracker();

  return (
    <>
      <Toaster position="top-right" richColors />
      {children}
    </>
  );
}
