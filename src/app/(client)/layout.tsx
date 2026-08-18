"use client";
import React, { Suspense } from "react";

import { DataProvider } from "~/store/GlobalState";
import ErrorBoundary from "~/components/error-boundary/Error-boundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <DataProvider>
        <ErrorBoundary>
          <div className={`w-full relative`}>{children}</div>
        </ErrorBoundary>
      </DataProvider>
    </Suspense>
  );
}
